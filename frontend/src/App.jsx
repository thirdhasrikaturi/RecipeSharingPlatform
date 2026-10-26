import { useState, useEffect, useRef } from 'react';
import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authToken, setAuthToken] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authMessage, setAuthMessage] = useState('');
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [formMessage, setFormMessage] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    time: '',
    image: '',
    description: '',
    ingredients: '',
    instructions: '',
  });

  const [editingRecipeId, setEditingRecipeId] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [deletingRecipeId, setDeletingRecipeId] = useState(null);

  const [editFormData, setEditFormData] = useState({
    name: '',
    category: '',
    time: '',
    image: '',
    description: '',
    ingredients: '',
    instructions: '',
  });

  const [recipes, setRecipes] = useState([]);
  const [viewingRecipe, setViewingRecipe] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewerName, setReviewerName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewMessage, setReviewMessage] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // References for automatic scrolling
  const recipeDetailsRef = useRef(null);
  const editFormRef = useRef(null);

  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Automatically scroll to recipe details after View Recipe is clicked.
  useEffect(() => {
    if (viewingRecipe && recipeDetailsRef.current) {
      recipeDetailsRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  }, [viewingRecipe?.id]);

  // Automatically scroll to the edit form after Edit Recipe is clicked.
  useEffect(() => {
    if (editingRecipeId !== null && editFormRef.current) {
      editFormRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  }, [editingRecipeId]);

  // Attach the login token to protected backend requests.
  const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${authToken}`,
  });

  // Admins can manage every recipe.
  // Regular users can manage only their own recipes.
  const canManageRecipe = (recipe) =>
    currentUser?.role === 'admin' ||
    (
      currentUser?.id != null &&
      recipe.user_id != null &&
      String(recipe.user_id) === String(currentUser.id)
    );

  const myRecipesCount = recipes.filter(
    (recipe) =>
      currentUser?.id != null &&
      recipe.user_id != null &&
      String(recipe.user_id) === String(currentUser.id)
  ).length;

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  // LOGIN
  const handleLogin = async (event) => {
    event.preventDefault();
    setIsAuthLoading(true);
    setAuthMessage('');

    try {
      const response = await fetch(
        'http://localhost:5000/api/auth/login',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: authEmail.trim(),
            password: authPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed.');
      }

      if (!data.token || !data.user) {
        throw new Error(
          'Login response is missing the token or user details.'
        );
      }

      setAuthToken(data.token);
      setCurrentUser(data.user);
      setIsLoggedIn(true);
      setShowLogin(false);
      setShowRegister(false);
      setAuthEmail('');
      setAuthPassword('');
      setAuthMessage('');
      setFormMessage('');

      const recipesResponse = await fetch(
        'http://localhost:5000/api/recipes'
      );

      if (recipesResponse.ok) {
        const recipesData = await recipesResponse.json();
        setRecipes(recipesData);
      }
    } catch (error) {
      setAuthMessage(error.message || 'Unable to log in.');
    } finally {
      setIsAuthLoading(false);
    }
  };

  // REGISTER
  const handleRegister = async (event) => {
    event.preventDefault();
    setIsAuthLoading(true);
    setAuthMessage('');

    try {
      const response = await fetch(
        'http://localhost:5000/api/auth/register',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            full_name: authName.trim(),
            email: authEmail.trim(),
            password: authPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed.');
      }

      setShowRegister(false);
      setShowLogin(true);
      setAuthName('');
      setAuthPassword('');
      setAuthMessage('Registration successful! Please log in.');
    } catch (error) {
      setAuthMessage(error.message || 'Unable to register.');
    } finally {
      setIsAuthLoading(false);
    }
  };

  // LOGOUT
  const handleLogout = () => {
    setIsLoggedIn(false);
    setAuthToken('');
    setCurrentUser(null);

    setShowLogin(false);
    setShowRegister(false);
    setShowForm(false);
    setEditingRecipeId(null);
    setViewingRecipe(null);

    setAuthName('');
    setAuthEmail('');
    setAuthPassword('');
    setAuthMessage('');
    setFormMessage('');
    setSearch('');
  };

  // VIEW RECIPE AND ITS REVIEWS
  const handleViewRecipe = async (recipe) => {
    setViewingRecipe(recipe);
    setReviews([]);
    setReviewMessage('');

    try {
      const response = await fetch(
        `http://localhost:5000/api/recipes/${recipe.id}/reviews`
      );

      if (!response.ok) {
        throw new Error('Failed to load reviews.');
      }

      const data = await response.json();
      setReviews(data);
    } catch (error) {
      console.error('Error loading reviews:', error);
      setReviewMessage('Unable to load reviews. Please try again.');
    }
  };

  // SUBMIT REVIEW
  const handleSubmitReview = async (event) => {
    event.preventDefault();

    if (!viewingRecipe) return;

    if (!reviewerName.trim()) {
      setReviewMessage('Please enter your name.');
      return;
    }

    setIsSubmittingReview(true);
    setReviewMessage('');

    try {
      const response = await fetch(
        `http://localhost:5000/api/recipes/${viewingRecipe.id}/reviews`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            reviewer_name: reviewerName.trim(),
            rating: Number(reviewRating),
            comment: reviewComment.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit review.');
      }

      const reviewsResponse = await fetch(
        `http://localhost:5000/api/recipes/${viewingRecipe.id}/reviews`
      );

      if (!reviewsResponse.ok) {
        throw new Error('Review saved, but refreshing reviews failed.');
      }

      const updatedReviews = await reviewsResponse.json();
      setReviews(updatedReviews);
      setReviewerName('');
      setReviewRating(5);
      setReviewComment('');
      setReviewMessage('Review submitted successfully!');
    } catch (error) {
      console.error('Error submitting review:', error);
      setReviewMessage(error.message || 'Failed to submit review.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // OPEN EDIT FORM
  const handleEditClick = (recipe) => {
    if (!canManageRecipe(recipe)) {
      alert('You can edit only your own recipes.');
      return;
    }

    setEditFormData({
      name: recipe.name || '',
      category: recipe.category || '',
      time: recipe.time || '',
      image: recipe.image || '',
      description: recipe.description || '',
      ingredients: recipe.ingredients || '',
      instructions: recipe.instructions || '',
    });

    setEditingRecipeId(recipe.id);
  };

  const handleEditInputChange = (event) => {
    const { name, value } = event.target;

    setEditFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  // UPDATE RECIPE
  const handleUpdateRecipe = async (event) => {
    event.preventDefault();

    if (!editFormData.name.trim() || !editFormData.category.trim()) {
      alert('Please enter both recipe name and category.');
      return;
    }

    if (editFormData.name.trim().length < 2) {
      alert('Recipe name must contain at least 2 characters.');
      return;
    }

    setIsUpdating(true);

    try {
      const response = await fetch(
        `http://localhost:5000/api/recipes/${editingRecipeId}`,
        {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify(editFormData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update recipe.');
      }

      const updatedResponse = await fetch(
        'http://localhost:5000/api/recipes'
      );

      if (!updatedResponse.ok) {
        throw new Error('Recipe updated, but refreshing the list failed.');
      }

      const updatedRecipes = await updatedResponse.json();
      setRecipes(updatedRecipes);

      if (
        viewingRecipe &&
        String(viewingRecipe.id) === String(editingRecipeId)
      ) {
        const updatedRecipe = updatedRecipes.find(
          (recipe) => String(recipe.id) === String(editingRecipeId)
        );

        if (updatedRecipe) {
          setViewingRecipe(updatedRecipe);
        }
      }

      setEditingRecipeId(null);
      alert('Recipe updated successfully!');
    } catch (error) {
      console.error('Error updating recipe:', error);
      alert(error.message || 'Failed to update recipe.');
    } finally {
      setIsUpdating(false);
    }
  };

  // DELETE RECIPE
  const handleDeleteRecipe = async (recipeId) => {
    const recipe = recipes.find(
      (item) => String(item.id) === String(recipeId)
    );

    if (!recipe || !canManageRecipe(recipe)) {
      setFormMessage('You cannot delete another user’s recipe.');
      return;
    }

    const confirmed = window.confirm(
      'Are you sure you want to delete this recipe?'
    );

    if (!confirmed) return;

    setDeletingRecipeId(recipeId);
    setFormMessage('');

    try {
      const response = await fetch(
        `http://localhost:5000/api/recipes/${recipeId}`,
        {
          method: 'DELETE',
          headers: getAuthHeaders(),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete recipe.');
      }

      setRecipes((previousRecipes) =>
        previousRecipes.filter(
          (item) => String(item.id) !== String(recipeId)
        )
      );

      if (
        viewingRecipe &&
        String(viewingRecipe.id) === String(recipeId)
      ) {
        setViewingRecipe(null);
      }

      if (String(editingRecipeId) === String(recipeId)) {
        setEditingRecipeId(null);
      }

      setFormMessage('Recipe deleted successfully!');
    } catch (error) {
      console.error('Error deleting recipe:', error);
      setFormMessage(
        error.message || 'Failed to delete recipe. Please try again.'
      );
    } finally {
      setDeletingRecipeId(null);
    }
  };

  // ADD RECIPE
  const handleAddRecipe = async (event) => {
    event.preventDefault();

    if (!formData.name.trim() || !formData.category.trim()) {
      setFormMessage('Please enter both recipe name and category.');
      return;
    }

    if (formData.name.trim().length < 2) {
      setFormMessage('Recipe name must contain at least 2 characters.');
      return;
    }

    setFormMessage('');
    setIsAdding(true);

    try {
      const response = await fetch(
        'http://localhost:5000/api/recipes',
        {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(formData),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to add recipe.');
      }

      const recipesResponse = await fetch(
        'http://localhost:5000/api/recipes'
      );

      if (!recipesResponse.ok) {
        throw new Error('Recipe added, but refreshing the list failed.');
      }

      const updatedRecipes = await recipesResponse.json();
      setRecipes(updatedRecipes);

      setFormMessage('Recipe added successfully!');

      setFormData({
        name: '',
        category: '',
        time: '',
        image: '',
        description: '',
        ingredients: '',
        instructions: '',
      });

      setShowForm(false);
    } catch (error) {
      console.error('Error adding recipe:', error);
      setFormMessage(
        error.message || 'Unable to add recipe. Please try again.'
      );
    } finally {
      setIsAdding(false);
    }
  };

  // LOAD RECIPES
  useEffect(() => {
    fetch('http://localhost:5000/api/recipes')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Could not load recipes.');
        }

        return response.json();
      })
      .then((data) => {
        setRecipes(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Unable to load recipes. Please check your backend.');
        setLoading(false);
      });
  }, []);

  const filteredRecipes = recipes.filter((recipe) =>
    `${recipe.name} ${recipe.category}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="app">
      <nav className="navbar">
        <a className="logo" href="#home">
          <span>🍲</span> RecipeShare
        </a>

        {isLoggedIn && (
          <div className="nav-links">
            <a href="#home">Home</a>
            <a href="#recipes">Recipes</a>
            <a href="#about">Reviews</a>
          </div>
        )}

        {isLoggedIn && (
          <a className="share-button" href="#recipes">
            Explore Recipes
          </a>
        )}

        <div className="auth-buttons">
          {!isLoggedIn ? (
            <>
              <button
                className="login-btn"
                onClick={() => {
                  setShowLogin(true);
                  setShowRegister(false);
                  setAuthMessage('');
                }}
              >
                Login
              </button>

              <button
                className="register-btn"
                onClick={() => {
                  setShowRegister(true);
                  setShowLogin(false);
                  setAuthMessage('');
                }}
              >
                Register
              </button>
            </>
          ) : (
            <button className="register-btn" onClick={handleLogout}>
              Logout
            </button>
          )}
        </div>
      </nav>

      {showLogin && (
        <form className="add-recipe-form" onSubmit={handleLogin}>
          <h2>Login</h2>

          <input
            type="email"
            placeholder="Email"
            value={authEmail}
            onChange={(event) => setAuthEmail(event.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={authPassword}
            onChange={(event) => setAuthPassword(event.target.value)}
            required
          />

          <button type="submit" disabled={isAuthLoading}>
            {isAuthLoading ? 'Logging in...' : 'Login'}
          </button>

          <button type="button" onClick={() => setShowLogin(false)}>
            Cancel
          </button>

          {authMessage && <p>{authMessage}</p>}
        </form>
      )}

      {showRegister && (
        <form className="add-recipe-form" onSubmit={handleRegister}>
          <h2>Create Account</h2>

          <input
            type="text"
            placeholder="Full name"
            value={authName}
            onChange={(event) => setAuthName(event.target.value)}
            required
          />

          <input
            type="email"
            placeholder="Email"
            value={authEmail}
            onChange={(event) => setAuthEmail(event.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password (minimum 8 characters)"
            value={authPassword}
            onChange={(event) => setAuthPassword(event.target.value)}
            minLength={8}
            required
          />

          <button type="submit" disabled={isAuthLoading}>
            {isAuthLoading ? 'Registering...' : 'Register'}
          </button>

          <button type="button" onClick={() => setShowRegister(false)}>
            Cancel
          </button>

          {authMessage && <p>{authMessage}</p>}
        </form>
      )}

      {isLoggedIn && (
        <section className="recipe-stats">
          <div className="recipe-stat">
            <h3>My Recipes</h3>
            <p>{myRecipesCount}</p>
          </div>

          <div className="recipe-stat">
            <h3>All Recipes</h3>
            <p>{recipes.length}</p>
          </div>

          <div className="recipe-stat">
            <h3>Role</h3>
            <p>
              {currentUser?.role === 'admin' ? 'Admin' : 'User'}
            </p>
          </div>
        </section>
      )}

      {isLoggedIn && (
        <button
          type="button"
          className="add-recipe-btn"
          onClick={() => {
            setFormMessage('');
            setShowForm(!showForm);
          }}
        >
          {showForm ? 'Cancel' : 'Add Recipe'}
        </button>
      )}

      {formMessage && (
        <p className="success-message">{formMessage}</p>
      )}

      {showForm && isLoggedIn && (
        <form onSubmit={handleAddRecipe} className="add-recipe-form">
          <h2>Add a New Recipe</h2>

          <input
            type="text"
            name="name"
            placeholder="Recipe name"
            value={formData.name}
            onChange={handleInputChange}
            required
          />

          <input
            type="text"
            name="category"
            placeholder="Category (e.g. Italian)"
            value={formData.category}
            onChange={handleInputChange}
            required
          />

          <input
            type="text"
            name="time"
            placeholder="Cooking time (e.g. 20 min)"
            value={formData.time}
            onChange={handleInputChange}
          />

          <input
            type="url"
            name="image"
            placeholder="Image URL (optional)"
            value={formData.image}
            onChange={handleInputChange}
          />

          <textarea
            name="description"
            placeholder="Recipe description"
            value={formData.description}
            onChange={handleInputChange}
            rows="4"
          />

          <textarea
            name="ingredients"
            placeholder="Ingredients"
            value={formData.ingredients}
            onChange={handleInputChange}
            rows="4"
          />

          <textarea
            name="instructions"
            placeholder="Preparation instructions (step by step)"
            value={formData.instructions}
            onChange={handleInputChange}
            rows="6"
          />

          <button type="submit" disabled={isAdding}>
            {isAdding ? 'Saving...' : 'Save Recipe'}
          </button>

          <button
            type="button"
            disabled={isAdding}
            onClick={() => {
              setShowForm(false);
              setFormMessage('');
              setFormData({
                name: '',
                category: '',
                time: '',
                image: '',
                description: '',
                ingredients: '',
                instructions: '',
              });
            }}
          >
            Cancel
          </button>
        </form>
      )}

      <main>
        <section className="hero" id="home">
          <p className="eyebrow">DISCOVER · COOK · SHARE</p>

          <h1>
            Every recipe has
            <br />
            a <span>story to share.</span>
          </h1>

          <p className="hero-description">
            Discover delicious recipes, find inspiration, and
            bring people together through food.
          </p>

          {isLoggedIn && (
            <a className="primary-button" href="#recipes">
              Explore Recipes →
            </a>
          )}
        </section>

        <section className="recipes-section" id="recipes">
          <div className="section-heading">
            <div>
              <p className="eyebrow">MADE WITH LOVE</p>

              {isLoggedIn && (
                <>
                  <h2>Explore Our Recipes</h2>
                  <p>Find your next favorite dish.</p>
                </>
              )}
            </div>
          </div>

          {isLoggedIn && (
            <input
              className="search-input"
              type="text"
              placeholder="Search recipes or categories..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          )}

          {isLoggedIn && loading && <p>Loading recipes...</p>}

          {isLoggedIn && error && (
            <p className="no-results">{error}</p>
          )}

          {isLoggedIn && !loading && !error && (
            <>
              <div className="recipe-grid">
                {filteredRecipes.map((recipe) => (
                  <article className="recipe-card" key={recipe.id}>
                    <img
                      src={
                        recipe.image ||
                        'https://images.unsplash.com/photo-1547592180-85f173990554?w=600'
                      }
                      alt={recipe.name}
                      onError={(event) => {
                        event.currentTarget.onerror = null;
                        event.currentTarget.src =
                          'https://images.unsplash.com/photo-1547592180-85f173990554?w=600';
                      }}
                    />

                    {canManageRecipe(recipe) && (
                      <>
                        <button
                          type="button"
                          className="edit-recipe-btn"
                          onClick={() => handleEditClick(recipe)}
                        >
                          Edit Recipe
                        </button>

                        <button
                          type="button"
                          className="delete-recipe-btn"
                          disabled={deletingRecipeId === recipe.id}
                          onClick={() => handleDeleteRecipe(recipe.id)}
                        >
                          {deletingRecipeId === recipe.id
                            ? 'Deleting...'
                            : 'Delete Recipe'}
                        </button>
                      </>
                    )}

                    <div className="recipe-content">
                      <span className="category">
                        {recipe.category}
                      </span>

                      <h3>{recipe.name}</h3>
                      <p>{recipe.description}</p>

                      <div className="recipe-footer">
                        <span>⏱ {recipe.time || 'Not specified'}</span>

                        <button
                          type="button"
                          className="view-recipe-btn"
                          onClick={() => handleViewRecipe(recipe)}
                        >
                          View Recipe
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              {viewingRecipe && (
                <section
                  className="recipe-details"
                  ref={recipeDetailsRef}
                >
                  <button
                    type="button"
                    className="close-recipe-btn"
                    onClick={() => setViewingRecipe(null)}
                  >
                    Close Recipe
                  </button>

                  <h2>{viewingRecipe.name}</h2>

                  <img
                    src={
                      viewingRecipe.image ||
                      'https://images.unsplash.com/photo-1547592180-85f173990554?w=600'
                    }
                    alt={viewingRecipe.name}
                  />

                  <p>
                    <strong>Category:</strong> {viewingRecipe.category}
                  </p>

                  <p>
                    <strong>Cooking Time:</strong>{' '}
                    {viewingRecipe.time || 'Not specified'}
                  </p>

                  <p>
                    <strong>Description:</strong>{' '}
                    {viewingRecipe.description || 'No description available.'}
                  </p>

                  <h3>Ingredients</h3>
                  <p className="recipe-detail-text">
                    {viewingRecipe.ingredients || 'Ingredients not added yet.'}
                  </p>

                  <h3>Preparation Instructions</h3>
                  <p className="recipe-detail-text">
                    {viewingRecipe.instructions ||
                      'Preparation instructions not added yet.'}
                  </p>

                  <h3>Rate This Recipe</h3>

                  <form
                    onSubmit={handleSubmitReview}
                    className="review-form"
                  >
                    <label htmlFor="reviewerName">Your Name</label>
                    <input
                      id="reviewerName"
                      type="text"
                      value={reviewerName}
                      onChange={(event) =>
                        setReviewerName(event.target.value)
                      }
                      placeholder="Enter your name"
                      maxLength={100}
                      required
                    />

                    <label htmlFor="reviewRating">Your Rating</label>
                    <select
                      id="reviewRating"
                      value={reviewRating}
                      onChange={(event) =>
                        setReviewRating(Number(event.target.value))
                      }
                    >
                      <option value={5}>5 - Excellent</option>
                      <option value={4}>4 - Very Good</option>
                      <option value={3}>3 - Good</option>
                      <option value={2}>2 - Fair</option>
                      <option value={1}>1 - Poor</option>
                    </select>

                    <label htmlFor="reviewComment">Your Review</label>
                    <textarea
                      id="reviewComment"
                      value={reviewComment}
                      onChange={(event) =>
                        setReviewComment(event.target.value)
                      }
                      placeholder="Share your experience with this recipe"
                      rows={4}
                      maxLength={2000}
                    />

                    <button type="submit" disabled={isSubmittingReview}>
                      {isSubmittingReview
                        ? 'Submitting...'
                        : 'Submit Review'}
                    </button>
                  </form>

                  {reviewMessage && (
                    <p className="review-message">{reviewMessage}</p>
                  )}

                  <h3>Customer Reviews ({reviews.length})</h3>

                  {reviews.length === 0 ? (
                    <p>
                      No reviews yet. Be the first to review this recipe!
                    </p>
                  ) : (
                    <div className="reviews-list">
                      {reviews.map((review) => (
                        <article className="review-card" key={review.id}>
                          <h4>{review.reviewer_name}</h4>
                          <p>
                            {'⭐'.repeat(Number(review.rating))}{' '}
                            ({review.rating}/5)
                          </p>
                          <p>{review.comment || 'No written comment.'}</p>
                          <small>
                            {new Date(review.created_at).toLocaleDateString()}
                          </small>
                        </article>
                      ))}
                    </div>
                  )}
                </section>
              )}

              {editingRecipeId !== null && (
                <form
                  ref={editFormRef}
                  onSubmit={handleUpdateRecipe}
                  className="add-recipe-form"
                >
                  <h2>Edit Recipe</h2>

                  <input
                    type="text"
                    name="name"
                    placeholder="Recipe name"
                    value={editFormData.name}
                    onChange={handleEditInputChange}
                    required
                  />

                  <input
                    type="text"
                    name="category"
                    placeholder="Category"
                    value={editFormData.category}
                    onChange={handleEditInputChange}
                    required
                  />

                  <input
                    type="text"
                    name="time"
                    placeholder="Cooking time"
                    value={editFormData.time}
                    onChange={handleEditInputChange}
                  />

                  <input
                    type="url"
                    name="image"
                    placeholder="Image URL"
                    value={editFormData.image}
                    onChange={handleEditInputChange}
                  />

                  <textarea
                    name="description"
                    placeholder="Recipe description"
                    value={editFormData.description}
                    onChange={handleEditInputChange}
                    rows="4"
                  />

                  <textarea
                    name="ingredients"
                    placeholder="Ingredients"
                    value={editFormData.ingredients}
                    onChange={handleEditInputChange}
                    rows="4"
                  />

                  <textarea
                    name="instructions"
                    placeholder="Preparation instructions (step by step)"
                    value={editFormData.instructions}
                    onChange={handleEditInputChange}
                    rows="6"
                  />

                  <button type="submit" disabled={isUpdating}>
                    {isUpdating ? 'Saving...' : 'Save Changes'}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setEditingRecipeId(null);
                      setEditFormData({
                        name: '',
                        category: '',
                        time: '',
                        image: '',
                        description: '',
                        ingredients: '',
                        instructions: '',
                      });
                    }}
                  >
                    Cancel
                  </button>
                </form>
              )}

              {filteredRecipes.length === 0 && (
                <p className="no-results">
                  No recipes found. Try another search!
                </p>
              )}
            </>
          )}
        </section>

        <section className="about-section" id="about">
          <h2>Good food brings us together.</h2>
          <p>
            RecipeShare is a place to discover recipes and share
            your love of cooking.
          </p>
        </section>
      </main>

      <footer>
        © 2026 RecipeShare. Made with ❤️ for food lovers.
      </footer>
    </div>
  );
}

export default App;
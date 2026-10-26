
const db = require('./db');
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

require('dotenv').config();
console.log('JWT_SECRET loaded:', !!process.env.JWT_SECRET);

const app = express();
function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      message: 'Please log in first.'
    });
  }

  const token = authHeader.split(' ')[1];

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({
        message: 'Invalid or expired login. Please log in again.'
      });
    }

    req.user = decoded;
    next();
  });
}
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Home route
app.get('/', (req, res) => {
  res.send('Recipe Sharing Platform backend is running!');
});

// Get all recipes
app.get('/api/recipes', (req, res) => {
  const sql = 'SELECT * FROM recipes ORDER BY id';

  db.query(sql, (error, results) => {
    if (error) {
      console.error('Error fetching recipes:', error.message);
      return res.status(500).json({
        message: 'Failed to fetch recipes from database',
      });
    }

    return res.json(results);
  });
});

// Add a recipe

app.post('/api/recipes', verifyToken, (req, res) => {
  const {
    name,
    category,
    time,
    image,
    description,
    ingredients,
    instructions,
  } = req.body;

  if (!name || !category) {
    return res.status(400).json({
      message: 'Recipe name and category are required',
    });
  }

  const sql = `
    INSERT INTO recipes
    (name, category, time, image, description, ingredients, instructions, user_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    name,
    category,
    time || null,
    image || null,
    description || null,
    ingredients || null,
    instructions || null,
    req.user.id,
  ];

  db.query(sql, values, (error, result) => {
    if (error) {
      console.error('Error adding recipe:', error.message);
      return res.status(500).json({
        message: 'Failed to add recipe',
      });
    }

    return res.status(201).json({
      message: 'Recipe added successfully!',
      id: result.insertId,
    });
  });
});

// Delete a recipe

app.delete('/api/recipes/:id', verifyToken, (req, res) => {
  const recipeId = req.params.id;

  // First, check who owns this recipe
  db.query(
    'SELECT id, user_id FROM recipes WHERE id = ?',
    [recipeId],
    (error, results) => {
      if (error) {
        console.error('Error checking recipe:', error.message);
        return res.status(500).json({
          message: 'Failed to check recipe permissions',
        });
      }

      if (results.length === 0) {
        return res.status(404).json({
          message: 'Recipe not found',
        });
      }

      const recipe = results[0];

      // Admins can delete any recipe.
      // Regular users can delete only their own recipes.
      if (
        req.user.role !== 'admin' &&
        recipe.user_id !== req.user.id
      ) {
        return res.status(403).json({
          message: 'You can delete only your own recipes',
        });
      }

      // Permission granted: delete the recipe
      db.query(
        'DELETE FROM recipes WHERE id = ?',
        [recipeId],
        (deleteError) => {
          if (deleteError) {
            console.error('Error deleting recipe:', deleteError.message);
            return res.status(500).json({
              message: 'Failed to delete recipe',
            });
          }

          return res.json({
            message: 'Recipe deleted successfully!',
          });
        }
      );
    }
  );
});

// Update a recipe

app.put('/api/recipes/:id', verifyToken, (req, res) => {
  const recipeId = req.params.id;

  const {
    name,
    category,
    time,
    image,
    description,
    ingredients,
    instructions,
  } = req.body;

  if (!name || !category) {
    return res.status(400).json({
      message: 'Recipe name and category are required',
    });
  }

  // Find the recipe and check ownership
  db.query(
    'SELECT id, user_id FROM recipes WHERE id = ?',
    [recipeId],
    (error, results) => {
      if (error) {
        console.error('Error checking recipe:', error.message);
        return res.status(500).json({
          message: 'Failed to check recipe permissions',
        });
      }

      if (results.length === 0) {
        return res.status(404).json({
          message: 'Recipe not found',
        });
      }

      const recipe = results[0];

      // Admins can edit any recipe.
      // Regular users can edit only their own recipes.
      if (
        req.user.role !== 'admin' &&
        recipe.user_id !== req.user.id
      ) {
        return res.status(403).json({
          message: 'You can edit only your own recipes',
        });
      }

      const sql = `
        UPDATE recipes
        SET name = ?, category = ?, time = ?, image = ?,
            description = ?, ingredients = ?, instructions = ?
        WHERE id = ?
      `;

      const values = [
        name,
        category,
        time || null,
        image || null,
        description || null,
        ingredients || null,
        instructions || null,
        recipeId,
      ];

      db.query(sql, values, (updateError, result) => {
        if (updateError) {
          console.error('Error updating recipe:', updateError.message);
          return res.status(500).json({
            message: 'Failed to update recipe',
          });
        }

        return res.json({
          message: 'Recipe updated successfully!',
        });
      });
    }
  );
});


// Add a review
app.post('/api/recipes/:id/reviews', (req, res) => {
  const recipeId = Number(req.params.id);
  const { reviewer_name, rating, comment } = req.body;

  if (!Number.isInteger(recipeId) || recipeId <= 0) {
    return res.status(400).json({
      message: 'Invalid recipe ID',
    });
  }

  if (!reviewer_name || !reviewer_name.trim()) {
    return res.status(400).json({
      message: 'Reviewer name is required',
    });
  }

  if (
    !Number.isInteger(Number(rating)) ||
    Number(rating) < 1 ||
    Number(rating) > 5
  ) {
    return res.status(400).json({
      message: 'Rating must be between 1 and 5',
    });
  }

  const sql = `
    INSERT INTO reviews
      (recipe_id, reviewer_name, rating, comment)
    SELECT id, ?, ?, ?
    FROM recipes
    WHERE id = ?
  `;

  db.query(
    sql,
    [reviewer_name.trim(), Number(rating), comment || null, recipeId],
    (error, result) => {
      if (error) {
        console.error('Error adding review:', error.message);
        return res.status(500).json({
          message: 'Failed to add review',
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          message: 'Recipe not found',
        });
      }

      return res.status(201).json({
        message: 'Review submitted successfully!',
        id: result.insertId,
      });
    }
  );
});

// Get reviews for a recipe
app.get('/api/recipes/:id/reviews', (req, res) => {
  const recipeId = Number(req.params.id);

  if (!Number.isInteger(recipeId) || recipeId <= 0) {
    return res.status(400).json({
      message: 'Invalid recipe ID',
    });
  }

  const sql = `
    SELECT id, recipe_id, reviewer_name, rating, comment, created_at
    FROM reviews
    WHERE recipe_id = ?
    ORDER BY created_at DESC
  `;

  db.query(sql, [recipeId], (error, results) => {
    if (error) {
      console.error('Error fetching reviews:', error.message);
      return res.status(500).json({
        message: 'Failed to fetch reviews',
      });
    }

    return res.json(results);
  });
});

// Register
app.post('/api/auth/register', async (req, res) => {
  const { full_name, email, password } = req.body;

  if (!full_name?.trim() || !email?.trim() || !password) {
    return res.status(400).json({
      message: 'Name, email, and password are required.',
    });
  }

  if (password.length < 8) {
    return res.status(400).json({
      message: 'Password must contain at least 8 characters.',
    });
  }

  const normalizedEmail = email.trim().toLowerCase();

  try {
    const hashedPassword = await bcrypt.hash(password, 12);

    const sql = `
      INSERT INTO users (full_name, email, password)
      VALUES (?, ?, ?)
    `;

    db.query(
      sql,
      [full_name.trim(), normalizedEmail, hashedPassword],
      (error, result) => {
        if (error) {
          if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
              message: 'This email is already registered.',
            });
          }

          console.error('Registration error:', error.message);
          return res.status(500).json({
            message: 'Registration failed. Please try again.',
          });
        }

        return res.status(201).json({
          message: 'Registration successful!',
          userId: result.insertId,
        });
      }
    );
  } catch (error) {
    console.error('Password hashing error:', error.message);
    return res.status(500).json({
      message: 'Registration failed. Please try again.',
    });
  }
});

// Login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (!email?.trim() || !password) {
    return res.status(400).json({
      message: 'Email and password are required.',
    });
  }

  const sql = `
    SELECT id, full_name, email, password, role
    FROM users
    WHERE email = ?
  `;

  db.query(sql, [email.trim().toLowerCase()], async (error, results) => {
    if (error) {
      console.error('Login database error:', error.message);
      return res.status(500).json({
        message: 'Login failed. Please try again.',
      });
    }

    if (results.length === 0) {
      return res.status(401).json({
        message: 'Invalid email or password.',
      });
    }

    const user = results[0];

    try {
      const passwordMatches = await bcrypt.compare(
        password,
        user.password
      );

      if (!passwordMatches) {
        return res.status(401).json({
          message: 'Invalid email or password.',
        });
      }

      if (!process.env.JWT_SECRET) {
        console.error('JWT_SECRET is not configured.');
        return res.status(500).json({
          message: 'Authentication is not configured.',
        });
      }

      const token = jwt.sign(
  { id: user.id, email: user.email, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: '2h' }
);

      return res.json({
  message: 'Login successful!',
  token,
  user: {
    id: user.id,
    full_name: user.full_name,
    email: user.email,
    role: user.role
  }
});
    } catch (compareError) {
      console.error('Login error:', compareError.message);
      return res.status(500).json({
        message: 'Login failed. Please try again.',
      });
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Backend server running at http://localhost:${PORT}`);
});

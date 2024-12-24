// import jwt from 'jsonwebtoken';
// import   nodemailer from 'nodemailer'
// import connection from '../model/connection.js';
// import rs  from "randomstring" 
// export const save = async (req, res) => {
//   console.log(req.body);
//   console.log(req.file)
//   const filePath = req.file ? req.file. filename : null; 
//   console.log(filePath)
//   try {
//     const {
//       name,
//       lname,
//       email,
//       password,
//       address,
//       mobile,
//       city,
//       state,
//       countery ,
//       uname,
//       role,
//       bio,
//       gender,
//       pincode
//     } = req.body;
//     // Insert query
//     const query = `
//       INSERT INTO user (name, lname, email, password, address, mobile, city, state, countery, uname, role, bio, gender, pincode, pimage )
//       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? ,?)
//     `;

//     const values = [name, lname, email, password, address, mobile, city, state, countery, uname, role, bio, gender, pincode,filePath];

//     // Execute query
//     connection.query(query, values, async (error, results) => {
//       if (error) {
//         console.error('Error saving data:', error);
//         res.status(200).send({ message: 'Error saving data', error });
//         return;
//       }

//       const userId = results.insertId;

//       // Generate verification token
//       const verificationToken = jwt.sign({ userId, email }, 'your-secret-key', { expiresIn: '1d' });

//       // Create a transporter for nodemailer
//       const transporter = nodemailer.createTransport({
//         service: 'Gmail', // Or another email service
//         auth: {
//           user: 'python@ashagramtrust.org', // Replace with your email
//           pass: 'jnvk wufa fyrw fdwt' // Replace with your email password
//         }
//       });

//       // Verification link
//       const verificationLink = `http://localhost:4200/verify?token=${verificationToken}`;
//       // Email options
//       const mailOptions = {
//         from: 'python@ashagramtrust.org', // Replace with your email
//         to: email,
//         subject: 'Email Verification',
//         html: `
//           <h1>Email Verification</h1>
//           <p>Hello ${name},</p>
//           <p>Thank you for registering. Please verify your email by clicking the link below:</p>
//           <a href="${verificationLink}">Verify Email</a>
//           <p>This link will expire in 24 hours.</p>
//         `
//       };

//       // Send email
//       transporter.sendMail(mailOptions, (err, info) => {
//         if (err) {
//           console.error('Error sending email:', err);
//           res.status(200).send({ message: 'User saved, but failed to send verification email', error: err });
//           return;
//         }
//         console.log('Email sent:', info.response);
//         res.status(200).send({ message: 'User saved successfully! Verification email sent.', userId });
//       });
//     });
//   } catch (error) {
//     console.error('Error:', error);
//     res.status(200).send({ message: 'Internal Server Error' });
//   }
// };


import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import connection from '../model/connection.js';
import rs from "randomstring";

export const save = async (req, res) => {
  console.log(req.body);
  console.log(req.file);
  const filePath = req.file ? req.file.filename : null;

  try {
    const {
      name,
      lname,
      email,
      password,
      address,
      mobile,
      city,
      state,
      countery,
      uname,
      role,
      bio,
      gender,
      pincode
    } = req.body;

    // Check for unique email and username
    const checkQuery = `
      SELECT * FROM user WHERE email = ? OR uname = ?
    `;
    connection.query(checkQuery, [email, uname], (checkError, checkResults) => {
      if (checkError) {
        console.error('Error checking uniqueness:', checkError);
        res.json({ status:true,message: 'Error checking email/username uniqueness', error: checkError });
        return;
      }
      if (checkResults.length > 0) {
        // Handle duplicate email or username
        const duplicateField = checkResults[0].email === email ? 'email' : 'username';
        res.json({ status:false, message: `${duplicateField} already exists. Please choose a different one.` });
        return;
      }

      // Proceed with saving the user if no duplicates
      const query = `
        INSERT INTO user (name, lname, email, password, address, mobile, city, state, countery, uname, role, bio, gender, pincode, pimage)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const values = [name, lname, email, password, address, mobile, city, state, countery, uname, role, bio, gender, pincode, filePath];

      connection.query(query, values, async (error, results) => {
        if (error) {
          console.error('Error saving data:', error);
          res.json({ status:false,message: 'Error saving data', error });
          return;
        }

        const userId = results.insertId;

        // Generate verification token
        const verificationToken = jwt.sign({ userId, email }, 'your-secret-key', { expiresIn: '1d' });

        // Create a transporter for nodemailer
        const transporter = nodemailer.createTransport({
          service: 'Gmail',
          auth: {
            user: 'python@ashagramtrust.org', // Replace with your email
            pass: 'jnvk wufa fyrw fdwt' // Replace with your email password
          }
        });

        // Verification link
        const verificationLink = `http://localhost:4200/verify?token=${verificationToken}`;

        // Email options
        const mailOptions = {
          from: 'python@ashagramtrust.org',
          to: email,
          subject: 'Email Verification',
          html: `
            <h1>Email Verification</h1>
            <p>Hello ${name},</p>
            <p>Thank you for registering. Please verify your email by clicking the link below:</p>
            <a href="${verificationLink}">Verify Email</a>
            <p>This link will expire in 24 hours.</p>
          `
        };

        // Send email
        transporter.sendMail(mailOptions, (err, info) => {
          if (err) {
            console.error('Error sending email:', err);
            res.json({status:false, message: 'User saved, but failed to send verification email', error: err });
            return;
          }
          console.log('Email sent:', info.response);
          res.json({ status:true,message: 'User saved successfully! Verification email sent.', userId });
        });
      });
    });
  } catch (error) {
    console.error('Error:', error);
    res.json({ message: 'Internal Server Error' });
  }
};







export  const verfiy=async(req,res)=>{
  try {
    // Log the received request for debugging
    console.log('Received request:', req.body);

    // Check if the token is provided in the request body
    const token = req.body.token;
    if (!token) {
      return res.status(200).send({ status:false, message: 'Token is missing' });
    }

    // Verify the JWT token
    let decoded;
    try {
      decoded = jwt.verify(token, 'your-secret-key'); // Replace with your actual secret key
    } catch (err) {
      console.error('JWT verification error:', err.message);
      return res.status(200).send({ status: false, message: 'Invalid or expired token' });
    }

    console.log('Decoded token:', decoded);

    // Query the database to check if the user exists based on email
    const selectQuery = 'SELECT status FROM user WHERE email = ?';
    connection.query(selectQuery, [decoded.email], (selectError, selectResults) => {
      if (selectError) {
        console.error('Database query error:', selectError);
        return res.status(200).send({ status: false, message: 'Database error', error: selectError });
      }

      // Check if the user exists
      if (selectResults.length === 0) {
        return res.status(200).send({ status: false, message: 'User not found' });
      }

      const userStatus = selectResults[0].status;
      console.log('User current status:', userStatus);

      // If the status is already 1, return a message indicating that
      if (userStatus === 1) {
        return res.status(200).send({
          status: true,
          message: 'User is already verified!',
          userStatus,
        });
      }

      // Update the user's status to 1
      const updateQuery = 'UPDATE user SET status = 1 WHERE email = ?';
      connection.query(updateQuery, [decoded.email], (updateError, updateResults) => {
        if (updateError) {
          console.error('Database update error:', updateError);
          return res.status(200).send({ status: false, message: 'Database error', error: updateError });
        }

        console.log('User status updated successfully:', updateResults);

        // Return a success response
        return res.status(200).send({
          status: true,
          message: 'Token successfully verified, user status updated to 1!',
          updatedStatus: 1,
        });
      });
    });
  } catch (error) {
    console.error('Error during verification:', error);
    return res.status(200).send({ status: false, message: 'Internal server error', error });
  }
  
}



export const updatepassword = async (req, res) => {
  try {
    // Log the received request for debugging
     const passwordnew=req.body.password;

    // Check if the token and password are provided in the request body
    const { token, password } = req.body;
    if (!token) {
      return res.status(200).send({ status: false, message: 'Token is missing' });
    }
    if (!password) {
      return res.status(200).send({ status: false, message: 'Password is missing' });
    }

    // Verify the JWT token
    let decoded;
    try {
      decoded = jwt.verify(token, 'your-secret-key'); // Replace with your actual secret key
    } catch (err) {
      console.error('JWT verification error:', err.message);
      return res.status(200).send({ status: false, message: 'Invalid or expired token' });
    }

    console.log('Decoded token:', decoded);

    // Check if the user exists in the database based on the decoded email
    const selectQuery = 'SELECT * FROM user WHERE email = ?';
    connection.query(selectQuery, [decoded.email], async (selectError, selectResults) => {
      if (selectError) {
        console.error('Database query error:', selectError);
        return res.status(200).send({ status: false, message: 'Database error', error: selectError });
      }
      // Check if the user exists
      if (selectResults.length === 0) {
        return res.status(200).send({ status: false, message: 'User not found' });
      }

      const user = selectResults[0];
      console.log('User found:', user);

      // Hash the new password before updating it in the database
      // const hashedPassword = await bcrypt.hash(password, 10);

      // Update the user's password in the database
      const updateQuery = 'UPDATE user SET password = ? WHERE email = ?';
      connection.query(updateQuery, [passwordnew, decoded.email], (updateError, updateResults) => {
        if (updateError) {
          console.error('Database update error:', updateError);
          return res.status(200).send({ status: false, message: 'Database error', error: updateError });
        }

        console.log('Password updated successfully:', updateResults);

        // Return a success response
        return res.status(200).send({
          status: false,
          message: 'Password updated successfully!',
        });
      });
    });
  } catch (error) {
    console.error('Error during password update:', error);
    return res.status(200).send({ status: false, message: 'Internal server error', error });
  }
};



export const forgot = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(200).send({ state:false, message: 'Email is required' });
  }

  try {
    // Check if user exists
    const query = `SELECT id, name, email, status FROM user WHERE email = ?`;
    connection.query(query, [email], async (error, results) => {
      if (error) {
        console.error('Error querying user:', error);
        return res.status(200).send({state:false, message: 'Database error', error });
      }

      if (results.length === 0) {
        return res.status(200).send({state:false, message: 'User not found' });
      }

      const { id, name, status } = results[0];

      // Check if the user is verified
      if (status !== 1) {
        return res.status(200).send({state:false, message: 'User not verified' });
      }

      // Generate a reset token
      const resetToken = jwt.sign({ id, email }, 'your-secret-key', { expiresIn: '1h' });
      const resetLink = `http://localhost:4200/update/?token=${resetToken}`;

      // Configure the nodemailer transporter
      const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          user: 'python@ashagramtrust.org', // Replace with your email
          pass: 'jnvk wufa fyrw fdwt' // Replace with your email password (use environment variables in production)
        }
      });

      // Email options
      const mailOptions = {
        from: 'python@ashagramtrust.org',
        to: email,
        subject: 'Password Reset Request',
        html: `
          <h1>Password Reset</h1>
          <p>Hello ${name},</p>
          <p>Click the link below to reset your password. This link is valid for 1 hour:</p>
          <a href="${resetLink}">Reset Password</a>
          <p>If you did not request a password reset, you can ignore this email.</p>
        `
      };

      // Send email
      transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
          console.error('Error sending reset email:', err);
          return res.status(200).send({ state:false,message: 'Failed to send reset email', error: err });
        }

        console.log('Reset email sent:', info.response);
        return res.status(200).send({state:true, message: 'Password reset email sent successfully' });
      });
    });
  } catch (error) {
    console.error('Error:', error);
    return res
  }
}







// export const save = async (req, res) => {
//     console.log(req.body)
//   try {
//     const {
//         name,
//         lname,
//         email,
//         password,
//         address,
//         mobile,
//         city,
//         state,
//         countery=null, // Fix spelling here
//         uname,
//         role,
//         bio,
//         gender,
//         pincode
//       } = req.body;
      
//     // Insert query
//     const query = `
//     INSERT INTO user (name, lname, email, password, address, mobile, city, state, countery, uname, role, bio, gender, pincode)
//     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
//   `;
  
//   const values = [name, lname, email, password, address, mobile, city, state, countery, uname, role, bio, gender, pincode];

//     // Execute query
//     connection.query(query, values, (error, results) => {
//       if (error) {
//         console.error('Error saving data:', error);
//         res.status(200).send({ message: 'Error saving data', error });
//         return;
//       }
//       res.status(200).send({ message: 'User saved successfully!', userId: results.insertId });
//     });
//   } catch (error) {
//     console.error('Error:', error);
//     res.status(200).send({ message: 'Internal Server Error' });
//   }
// };



// Secret key for JWT
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(200).send({state:false, message: 'Email and password are required!' });
    }
    
    // Query to check if the user exists and password matches
    const query = `SELECT * FROM user WHERE email = ? AND password = ? AND status= ?`;
    connection.query(query, [email, password,1], (error, results) => {
      if (error) {
        console.error('Error checking user:', error);
        return res.status(200).send({state:false, message: 'Internal Server Error' });
      }

      if (results.length === 0) {
        // If user does not exist or password does not match
        return res.status(200).send({state:false, message: 'Invalid email or password!' });
      }
      const user = results[0];

      // Generate a JWT token
      const JWT_SECRET = 'your_jwt_secret_key'; // Replace with your secure secret key
      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        JWT_SECRET,
        { expiresIn: '1h' } // Token expires in 1 hour
      );

      // Send the token and all user fields
      res.status(200).send({state:true,
        message: 'Login successful!',
        token,
        user, // Send the entire user object
      });
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(200).send({ state:false,message: 'Internal Server Error' });
  }
};











export const fatch = async (req, res) => {
  try {
    const { id } = req.body;  // Accepting optional `id` from the request body

    let query = 'SELECT * FROM user';
    let values = [];

    if (id) {
      // If `id` is provided, fetch a specific user
      query += ' WHERE id = ?';
      values.push(id);
    }

    connection.query(query, values, (error, results) => {
      if (error) {
        console.error('Error fetching data:', error);
        return res.status(200).send({ state:false,message: 'Error fetching data', error });
      }

      if (results.length === 0) {
        return res.status(200).send({state:false, message: 'No data found!' });
      }

      res.status(200).send({
        state:true,
        message: 'Data fetched successfully!',
        data: results,
      });
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(200).send({state:false, message: 'Internal Server Error' });
  }
};







export const update = async (req, res) => {
  const userId = req.params.id;
  const {
    name,
    lname,
    email,
    uname,
    gender,
    city,
    state,
    countery,
    role,
    bio,
    mobile,
    address,
    pincode
  } = req.body;

  // SQL query to update the user
  const query = `
    UPDATE user
    SET 
      name = ?, lname = ?, email = ?, uname = ?, gender = ?, city = ?, 
      state = ?, countery = ?, role = ?, bio = ?, mobile = ?, address = ?, pincode = ?
    WHERE id = ?
  `;

  const values = [
    name,
    lname,
    email,
    uname,
    gender,
    city,
    state,
    countery,
    role,
    bio,
    mobile,
    address,
    pincode,
    userId
  ];

  try {
    // Use query() instead of execute() for simple queries
    connection.query(query, values, (err, result) => {
      if (err) {
        console.error('Error updating user:', err);
        return res.status(200).json({state:false, message: 'Error updating user', error: err.message });
      }

      // Check if the user was updated
      if (result.affectedRows === 0) {
        return res.status(200).json({state:false, message: 'User not found' });
      }

      return res.status(200).json({ state:true,message: 'User updated successfully' });
    });
  } catch (error) {
    console.error('Error:', error);
    return res.status(200).json({state:false, message: 'Server error', error: error.message });
  }
};


export const udelete = async (req, res) => {
    try {
      const { id } = req.query;  // Extract user ID from the query string
  
      if (!id) {
        return res.status(200).send({state:false, message: 'User ID is required!' });
      }
  
      // SQL query to delete the user by ID
      const query = 'DELETE FROM user WHERE id = ?';
  
      connection.query(query, [id], (error, results) => {
        if (error) {
          console.error('Error deleting user:', error);
          return res.status(200).send({state:false, message: 'Internal Server Error' });
        }
  
        if (results.affectedRows === 0) {
          return res.status(200).send({state:false, message: 'User not found' });
        }
  
        return res.status(200).send({state:true, message: 'User deleted successfully' });
      });
    } catch (error) {
      console.error('Error during user deletion:', error);
      return res.status(200).send({ state:false,message: 'Internal Server Error' });
    }
  };
  
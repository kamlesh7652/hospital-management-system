const { body, validationResult } = require('express-validator');

const GENDERS = ['male', 'female', 'other'];
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const PHONE_RE = /^[6-9]\d{9}$/;
const NAME_RE = /^[A-Za-z][A-Za-z .'-]*$/;

// Shared rules (create + update dono mein)
const commonRules = (optional = false) => {
  const opt = (chain) => (optional ? chain.optional({ checkFalsy: true }) : chain);

  return [
    opt(body('name').trim().notEmpty().withMessage('Name is required'))
      .isLength({ min: 3, max: 60 }).withMessage('Name must be 3-60 characters')
      .matches(NAME_RE).withMessage('Name can only contain letters, spaces, . \' -'),

    body('phone')
      .optional({ checkFalsy: true })
      .trim()
      .matches(PHONE_RE).withMessage('Enter a valid 10-digit mobile number'),

    opt(body('dateOfBirth').notEmpty().withMessage('Date of birth is required'))
      .isISO8601().withMessage('Invalid date of birth')
      .custom((v) => {
        const d = new Date(v);
        const now = new Date();
        if (d > now) throw new Error('Date of birth cannot be in the future');
        const age = (now - d) / (365.25 * 24 * 60 * 60 * 1000);
        if (age > 120) throw new Error('Enter a realistic date of birth');
        return true;
      }),

    opt(body('gender').notEmpty().withMessage('Gender is required'))
      .customSanitizer((v) => String(v).toLowerCase())
      .isIn(GENDERS).withMessage(`Gender must be one of: ${GENDERS.join(', ')}`),

    body('bloodGroup')
      .optional({ checkFalsy: true })
      .isIn(BLOOD_GROUPS).withMessage(`Blood group must be one of: ${BLOOD_GROUPS.join(', ')}`),

    body('address')
      .optional({ checkFalsy: true })
      .trim()
      .isLength({ max: 250 }).withMessage('Address cannot exceed 250 characters'),

    body('emergencyContact.name')
      .optional({ checkFalsy: true })
      .trim()
      .matches(NAME_RE).withMessage('Invalid emergency contact name'),

    body('emergencyContact.phone')
      .optional({ checkFalsy: true })
      .trim()
      .matches(PHONE_RE).withMessage('Enter a valid 10-digit emergency contact number')
      .custom((v, { req }) => {
        if (v && v === req.body.phone) {
          throw new Error('Emergency contact must differ from patient phone');
        }
        return true;
      }),
  ];
};

// Create: email + password bhi chahiye
const createPatientRules = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Enter a valid email address')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    .matches(/[A-Za-z]/).withMessage('Password needs at least one letter')
    .matches(/\d/).withMessage('Password needs at least one number'),

  ...commonRules(false),
];

// Update: sab optional, email/password change nahi hone chahiye
const updatePatientRules = [
  body('email').not().exists().withMessage('Email cannot be changed here'),
  body('password').not().exists().withMessage('Password cannot be changed here'),
  ...commonRules(true),
];

// Middleware: errors collect karke 400 bhejta hai
const validate = (req, res, next) => {
  const result = validationResult(req);
  if (result.isEmpty()) return next();

  return res.status(400).json({
    success: false,
    message: 'Validation failed',
    errors: result.array().map((e) => ({ field: e.path, message: e.msg })),
  });
};

module.exports = { createPatientRules, updatePatientRules, validate };
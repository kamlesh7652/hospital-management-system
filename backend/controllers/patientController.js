const User = require('../models/User');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const userFields = 'name email phone isActive createdAt';

// ---------------------------------------------------------------
// @desc    Create patient (User + Patient profile)
// @route   POST /api/patients
// @access  Admin, Receptionist
// ---------------------------------------------------------------
exports.createPatient = async (req, res) => {
  let user;
  try {
    const {
      name, email, password, phone,
      dateOfBirth, gender, bloodGroup, address, emergencyContact,
    } = req.body;

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    // 1. login account
    user = await User.create({ name, email, password, phone, role: 'patient' });

    // 2. patient profile
    const patient = await Patient.create({
      user: user._id,
      dateOfBirth,
      gender,
      bloodGroup,
      address,
      emergencyContact,
    });

    const populated = await Patient.findById(patient._id).populate('user', userFields);

    return res.status(201).json({
      success: true,
      message: 'Patient created successfully',
      data: populated,
    });
  } catch (err) {
    // profile fail ho gaya to orphan user delete karo
    if (user) await User.findByIdAndDelete(user._id).catch(() => {});

    if (err.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: Object.values(err.errors).map((e) => ({ field: e.path, message: e.message })),
      });
    }
    console.error('createPatient:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ---------------------------------------------------------------
// @desc    List patients (search, filter, pagination)
// @route   GET /api/patients?search=&gender=&bloodGroup=&status=&page=&limit=
// @access  Admin, Receptionist, Doctor (sirf apne patients)
// ---------------------------------------------------------------
exports.getPatients = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 100);
    const { search, gender, bloodGroup, status } = req.query;

    const filter = {};
    if (gender) filter.gender = gender;
    if (bloodGroup) filter.bloodGroup = bloodGroup;

    // name/email/phone/status User collection par hain
    const userFilter = { role: 'patient' };
    if (status === 'active') userFilter.isActive = true;
    if (status === 'inactive') userFilter.isActive = false;
    if (search && search.trim()) {
      const rx = new RegExp(escapeRegex(search.trim()), 'i');
      userFilter.$or = [{ name: rx }, { email: rx }, { phone: rx }];
    }

    const needsUserFilter = Boolean(search || status);
    if (needsUserFilter) {
      const ids = await User.find(userFilter).distinct('_id');
      filter.user = { $in: ids };
    }

    // Doctor ko sirf wahi patients jinke saath uska appointment ho
    if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ user: req.user._id });
      if (!doctor) {
        return res.status(403).json({ success: false, message: 'Doctor profile not found' });
      }
      const patientIds = await Appointment.find({ doctor: doctor._id }).distinct('patient');
      filter._id = { $in: patientIds };
    }

    const [patients, total] = await Promise.all([
      Patient.find(filter)
        .populate('user', userFields)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Patient.countDocuments(filter),
    ]);

    return res.json({
      success: true,
      count: patients.length,
      total,
      page,
      pages: Math.ceil(total / limit) || 1,
      data: patients,
    });
  } catch (err) {
    console.error('getPatients:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ---------------------------------------------------------------
// @desc    Get single patient
// @route   GET /api/patients/:id
// @access  Admin, Receptionist, Doctor (apne patient), Patient (khud)
// ---------------------------------------------------------------
exports.getPatientById = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id).populate('user', userFields);
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    if (req.user.role === 'patient' && String(patient.user._id) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ user: req.user._id });
      const linked = doctor && (await Appointment.exists({ doctor: doctor._id, patient: patient._id }));
      if (!linked) {
        return res.status(403).json({ success: false, message: 'Not authorized' });
      }
    }

    return res.json({ success: true, data: patient });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid patient id' });
    }
    console.error('getPatientById:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ---------------------------------------------------------------
// @desc    Update patient (profile + name/phone)
// @route   PUT /api/patients/:id
// @access  Admin, Receptionist, Patient (khud ka profile)
// ---------------------------------------------------------------
exports.updatePatient = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    if (req.user.role === 'patient' && String(patient.user) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // User fields
    const { name, phone } = req.body;
    const userUpdate = {};
    if (name !== undefined) userUpdate.name = name;
    if (phone !== undefined) userUpdate.phone = phone;
    if (Object.keys(userUpdate).length) {
      await User.findByIdAndUpdate(patient.user, userUpdate, { runValidators: true });
    }

    // Patient fields (whitelist)
    const allowed = ['dateOfBirth', 'gender', 'bloodGroup', 'address', 'emergencyContact'];
    allowed.forEach((k) => {
      if (req.body[k] !== undefined) patient[k] = req.body[k];
    });
    await patient.save();

    const populated = await Patient.findById(patient._id).populate('user', userFields);
    return res.json({ success: true, message: 'Patient updated successfully', data: populated });
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: Object.values(err.errors).map((e) => ({ field: e.path, message: e.message })),
      });
    }
    if (err.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid patient id' });
    }
    console.error('updatePatient:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ---------------------------------------------------------------
// @desc    Deactivate / reactivate patient (soft delete)
// @route   PATCH /api/patients/:id/status   body: { isActive: true|false }
// @access  Admin
// ---------------------------------------------------------------
exports.setPatientStatus = async (req, res) => {
  try {
    const { isActive } = req.body;
    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ success: false, message: 'isActive must be true or false' });
    }

    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    await User.findByIdAndUpdate(patient.user, { isActive });

    const populated = await Patient.findById(patient._id).populate('user', userFields);
    return res.json({
      success: true,
      message: isActive ? 'Patient activated' : 'Patient deactivated',
      data: populated,
    });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid patient id' });
    }
    console.error('setPatientStatus:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ---------------------------------------------------------------
// @desc    Logged-in patient ka apna profile
// @route   GET /api/patients/me
// @access  Patient
// ---------------------------------------------------------------
exports.getMyProfile = async (req, res) => {
  try {
    const patient = await Patient.findOne({ user: req.user._id }).populate('user', userFields);
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient profile not found' });
    }
    return res.json({ success: true, data: patient });
  } catch (err) {
    console.error('getMyProfile:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
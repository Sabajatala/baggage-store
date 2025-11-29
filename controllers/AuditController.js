const Audit = require('../models/audit');

exports.getAudits = async (req, res) => {
  try {
    const audits = await Audit.find().sort({ createdAt: -1 });
    res.status(200).json(audits);
  } catch (error) {
    console.error('Error fetching audits:', error);
    res.status(500).json({ message: 'Failed to fetch audit logs' });
  }
};
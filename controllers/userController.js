const user = require('../models/userModel')

exports.getUser = (req, res) => {
   
        res.json({messages:"from getUser controller"});
        
}
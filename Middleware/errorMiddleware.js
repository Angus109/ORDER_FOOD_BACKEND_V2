module.exports = function(err, req, res) {
   return res.status(500).send(err)
}
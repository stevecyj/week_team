const errorHandle = (res, err) => {
  const errMsg = err ? err.message : '欄位未填寫正確，或無此 id'
  res.status(400).send({
    "status": false,
    "message": errMsg
  })
  res.end()
}
const successHandle = (res, data) => {
  res.send({
    "status": true,
    data
  })
  res.end()
}
module.exports = {
  errorHandle,
  successHandle
}
import * as joi from 'joi'

export default joi
  .object({
    server: joi.func().arity(0).required(),
  })
  .required()

import Joi from 'joi'

export default Joi.object({
  client: Joi.object()
    .keys({
      publish: Joi.func().minArity(3).maxArity(4).required(),
    })
    .required(),
  server: Joi.func().arity(1).required(),
}).required()

import * as joi from '@hapi/joi'

export default joi
  .object({
    server: joi
      .func()
      .arity(0)
      .required(),
  })
  .required()

import {object, func} from '@hapi/joi'

export default object({
  client: func()
    .arity(0)
    .required(),
  server: func()
    .arity(1)
    .required(),
}).required()

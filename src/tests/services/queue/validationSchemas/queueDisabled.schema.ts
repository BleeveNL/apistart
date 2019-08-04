import {object, func} from '@hapi/joi'

export default object({
  server: func()
    .arity(0)
    .required(),
}).required()

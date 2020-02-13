import {object as obj, func} from '@hapi/joi'

export default obj({
  client: func()
    .arity(0)
    .required(),
  server: func()
    .arity(1)
    .required(),
}).required()

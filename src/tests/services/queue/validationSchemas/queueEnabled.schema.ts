import {object as obj, func} from 'joi'

export default obj({
  client: obj()
    .keys({
      publish: func().minArity(3).maxArity(4).required(),
    })
    .required(),
  server: func().arity(1).required(),
}).required()

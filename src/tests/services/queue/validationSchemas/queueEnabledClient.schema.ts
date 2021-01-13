import {object as obj, func} from 'joi'

export default obj({
  publish: func().minArity(3).maxArity(4).required(),
}).required()

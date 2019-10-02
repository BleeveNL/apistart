import {object, func} from '@hapi/joi'

export default object({
  publish: func().minArity(3).maxArity(4).required()
}).required()

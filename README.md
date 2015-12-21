# observ-backbone
You will fly to heaven and your backbone models will become observable.

## Synopsis
```js
var Backbone = require('backbone')
var ObservBackbone = require('observ-backbone')
var ObservStruct = require('observ-struct')
var ObservArray = require('observ-array')

var Item = Backone.Model.extends({
  description: 'Some text here'
, done: false
})

var state = ObservStruct({
  todoItems: ObservArray([
    ObservBackbone(new Item)
  ])
})
```

## Legal
(c) 2014 by Raynos  
(c) 2015 by Marcel Klehr  
MIT License
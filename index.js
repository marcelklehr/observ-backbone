'use strict';
/**
 * Copyright (c) 2014 Raynos.
 * Copyright (c) 2015 Marcel Klehr
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
*/
/* This is a reference implementation of how to recursively
    observ a Backbone.Model.
    A proper implementation is going to need a bunch of
    performance optimizations
*/
module.exports = toObserv;

// given some model returns an observable of the model state
function toObserv(model) {
    // return an object
    var observ = function observ(listener) {
        // observ() with no args must return state
        if (!listener) {
            return serialize(model);
        }

        // observ(listener) should notify the listener on
        // every change
        listen(model, function serializeModel() {
            listener(serialize(model));
        });
    };
    ;['get', 'set', 'fetch', 'save', 'destroy', 'toJSON', 'isValid'].forEach(function(method) {
      observ[method] = model[method].bind(model)
    })
    observ.backboneModel = model
    return observ
}

// convert a Backbone model to JSON
function serialize(model) {
    var data = model.toJSON();
    Object.keys(data).forEach(function serializeRecur(key) {
        var value = data[key];
        // if any value can be serialized toJSON() then do it
        if (value && value.toJSON) {
            data[key] = data[key].toJSON();
        }
    });
    return data;
}

// listen to a Backbone model
function listen(model, listener) {
    model.on('change', listener);

    model.values().forEach(function listenRecur(value) {
        var isCollection = value && value._byId;

        if (!isCollection) {
            return;
        }

        // for each collection listen to it
        // console.log('listenCollection')
        listenCollection(value, listener);
    });
}

// listen to a Backbone collection
function listenCollection(collection, listener) {
    collection.forEach(function listenModel(model) {
        listen(model, listener);
    });

    collection.on('add', function onAdd(model) {
        listen(model, listener);
        listener();
    });
}

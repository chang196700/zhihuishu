const path = require('path')

window.noderequire = window.require;
delete window.require;
delete window.exports;
delete window.module;

function completed() {
    document.removeEventListener('DOMContentLoaded', completed)
    window.removeEventListener('load', completed)

    // $.holdReady()

    document.getElementsByTagName('script')[22]
}

document.addEventListener('DOMContentLoaded', completed)
window.addEventListener('load', completed)

console.log(document.head)

console.log(document.getElementsByTagName('script')[21])
console.log(document)
module.exports = app => {

    function deveExistir (value, msg) {
        if(!value) throw msg
        if(Array.isArray(value) && value.length === 0) throw msg
        if(typeof value === 'string' && !value.trim()) throw msg
    }
    
    const naoDeveExistir = (value, msg) => {
        if (value) throw msg 
    }

    const deveSerIgual = (value1, value2, msg) => {
        if (value1 !== value2) throw msg
    }

    return { deveExistir, naoDeveExistir, deveSerIgual }
}
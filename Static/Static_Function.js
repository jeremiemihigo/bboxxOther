module.exports = {
  isEmpty: function (value) {
    return (
      value === undefined ||
      value === null ||
      value == [] ||
      value == {} ||
      (typeof value === 'object' && Object.keys(value).length === 0) ||
      (typeof value === 'string' && value.trim().length === 0) ||
      Array.from(value).length === 0
    )
  },

  generateString: (length) => {
    const caractere = '123456789ABCDEFGHIJKLMNPRSTUVWXYZ'
    let resultat = ''
    let caractereLength = caractere.length
    for (let i = 0; i < length; i++) {
      resultat += caractere.charAt(Math.floor(Math.random() * caractereLength))
    }
    return resultat
  },
  generateNumber: (length) => {
    const caractere = '1234567890'
    let resultat = ''
    let caractereLength = caractere.length
    for (let i = 0; i < length; i++) {
      resultat += caractere.charAt(Math.floor(Math.random() * caractereLength))
    }
    return resultat
  },
  dateActuelle: (data) => {
    const jour = new Date(data)
    return `${jour.getDate()}/${jour.getMonth() + 1}/${jour.getFullYear()}`
  },
}

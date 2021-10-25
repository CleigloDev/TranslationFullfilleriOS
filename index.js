const fs = require('fs')

const readAndCompareFiles = async(fnCallback) => {
    try {
        const fileReadTranslated = fs.readFileSync('./fileToRead/translated.txt').toString() //file con traduzioni puliti di spazi e caratteri inutili come //MARK: 
        const fileReadReference = fs.readFileSync('./fileToRead/reference.txt').toString() //file di esempio con cui controllare le traduzioni uguali pulito come sopra(solitamente il file inglese)

        const translatedArray = fileReadTranslated.split(";");
        const referenceArray = fileReadReference.split(";");
        const redundanceArray = [];
        translatedArray.map((translated) => {
            const foundRedundance = referenceArray.find((reference, index) => {
                if(!reference || !translated) {
                    return false
                }
                const keyTranslated = translated.match(/"(.*)".*=/)[1]
                const keyReference = reference.match(/"(.*)".*=/)[1]
                const valueTranslated = translated.match(/=.*"(.*)"/)[1]
                const valueReference = reference.match(/=.*"(.*)"/)[1]

                return keyTranslated === keyReference && valueTranslated === valueReference
            })
            if(!!foundRedundance) {
                redundanceArray.push(foundRedundance)
            }
        })
        let testOutput = "";
        redundanceArray.map((redundance) => {
            testOutput += "\n" + redundance
        })

        fs.writeFile("./output/outputRedundace.txt", testOutput, fnCallback)

    } catch (err) {
        console.error(err)
        console.error("Failed to read file")
    }
}

const compareEqualToReference = async() => {
    const outputRedundance = fs.readFileSync('./output/outputRedundace.txt').toString() //file contentente le stringhe uguali rispetto al file di reference(stringhe inglesi nel file polacco)
    const incriminateMissing = fs.readFileSync('./fileToRead/incriminated_missing.txt').toString() //file contentente solo le chiavi che risultano essere mancati secondo il business con questo formato : "key"\n

    const redundaceArray = outputRedundance.split("\n")
    const missingArray = incriminateMissing.split("\n") 

    const arrayMissing = [];
    let missingText = "";
    redundaceArray.map((redundance) => {
        const foundRedundace = missingArray.find((missing) => {
            if(!missing || !redundance){
                return false
            }
            const keyRedundance = redundance.match(/"(.*)".*=/)[1]
            const keyMissing = missing.match(/"(.*)"/)[1]

            return keyRedundance === keyMissing
        })

        if(!!foundRedundace) {
            arrayMissing.push(foundRedundace)
        }
    })

    arrayMissing.map((missing) => {
        missingText += "\n" + missing
    })

    fs.writeFile("./output/outputMissing.txt", missingText, () => {}) //chavi effettivamente mancati
}

const insertChangedTranslation = async() => {
    let translatedFull = fs.readFileSync('./fileToRead/translatedFull.txt').toString() //file di traduzioni da modifcare preso dall'app
    const changedTranslation = fs.readFileSync('./fileToRead/changedTranslation.txt').toString() //file di traduzione da cambiare

    const changedTranslationArray = changedTranslation.split("\n")
    changedTranslationArray.map((changed) => {
        if(!changed) return
        const changedKey = changed.match(/"(.*)".*=/)[1]
        const changedValue = changed.match(/=.*"(.*)"/)[1]
        const newRegexp = RegExp("\""+changedKey +"\".*=.*\".*\"")
        translatedFull = translatedFull.replace(newRegexp, "\""+changedKey+"\" = \"" + changedValue + "\"")
    })

    fs.writeFile("./output/changedTranslation.txt", translatedFull, () => {}) //file con traduzioni modificate
}

//readAndCompareFiles(compareEqualToReference)

insertChangedTranslation()
var assetInfoHelper = {
    "idExists": function(id) {
        if (assetInfoLoaded) {
            if (assetInfo[id]) {
                return true
            }
        }
        return false
    },
    "findIdByName": function(name) {
        for (index in assetInfo) {
            let info = assetInfo[index]
            if (info.name == name) {
                return info.uniqueID
            }
        }
        return null
    },
    "findInfoByName": function(name) {
        for (index in assetInfo) {
            let info = assetInfo[index]
            if (info.name == name) {
                return info
            }
        }
        return null
    },
    "findIdsBySearch": function(search) {
        let results = []

        search = search.toLowerCase()
        search = search.replaceAll(" _"," ")
        search = search.replaceAll("_"," ")

        for (let index in assetInfo) {
            let info = assetInfo[index]
            let fixedName = info.name.toLowerCase()
            fixedName = fixedName.replaceAll(" _"," ")
            fixedName = fixedName.replaceAll("_"," ")

            let fixedLocalizedName = info.localizedName.toLowerCase()
            fixedLocalizedName = fixedLocalizedName.replaceAll(" _"," ")
            fixedLocalizedName = fixedLocalizedName.replaceAll("_"," ")

            let searchId = Number(search)

            if (fixedName.includes(search) || fixedLocalizedName.includes(search) || search === "" || info.uniqueID === searchId) {
                results.push(index)
            }
        }

        return results
    },
    "findInfosBySearch": function(search) {
        let results = []

        search = search.toLowerCase()
        search = search.replaceAll(" _"," ")
        search = search.replaceAll("_"," ")

        for (let index in assetInfo) {
            let info = assetInfo[index]
            let fixedName = info.name.toLowerCase()
            fixedName = fixedName.replaceAll(" _"," ")
            fixedName = fixedName.replaceAll("_"," ")

            let fixedLocalizedName = info.localizedName.toLowerCase()
            fixedLocalizedName = fixedLocalizedName.replaceAll(" _"," ")
            fixedLocalizedName = fixedLocalizedName.replaceAll("_"," ")

            let searchId = Number(search)

            if (fixedName.includes(search) || fixedLocalizedName.includes(search) || search === "" || info.uniqueID == searchId) {
                results.push(assetInfo[index])
            }
        }

        return results
    },
    "findIdsByCategory": function(category) {
        let results = []

        if (category === "None" || category === "Other") {
            category = ""
        }
        for (index in assetInfo) {
            let info = assetInfo[index]
            if (info.category == category) {
                results.push(info.uniqueID)
            }
        }

        return results
    },
    "findInfosByCategory": function(category) {
        let results = []

        if (category === "None" || category === "Other") {
            category = ""
        }
        for (index in assetInfo) {
            let info = assetInfo[index]
            if (info.category == category) {
                results.push(info)
            }
        }

        return results
    },
    "getExistingCategories": function() {
        let categories = []

        for (index in assetInfo) {
            let info = assetInfo[index]
            if (!categories.includes(info.category)) {
                categories.push(info.category)
            }
        }

        return categories
    }
}
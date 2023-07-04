"use-strict";
const INCLUDES_TILESETS = true

var currentInventory = new Inventory()
currentInventory.visualize()

var slotSize = 64

let importInput = document.getElementById("navbar-import")
let exportButton = document.getElementById("navbar-export")
let helpButton = document.getElementById("navbar-help")

let closeDialogButton = document.getElementById("close-dialog-help")

let alertElement = document.getElementById("alert")

let inventoryWidthElement = document.getElementById("inventory-width")
let inventoryHeightElement = document.getElementById("inventory-height")

let itemListCategory = document.getElementById("item-list-category")
let itemListResultCount = document.getElementById("item-list-result-count")
let itemList = document.getElementById("item-list")

function validateNumberInput(evt) {
    var regex = /[0-9]/;
    if(!regex.test(evt.key) ) {
        evt.preventDefault()
    }
}

function validateSizeNumberInput(evt) {
    var regex = /[0-9]/;
    
    if (evt.srcElement.value > 16) {
        evt.preventDefault()
        evt.srcElement.value = 16
    }

    if (evt.type !== "change") {
        if (Number(evt.srcElement.value + evt.key) > 16) {
            evt.preventDefault()
        }
    }

    if(!regex.test(evt.key) ) {
        evt.preventDefault()
    }

    let newWidth = Number(inventoryWidthElement.value)
    if (!isNaN(newWidth) && newWidth > 0 && newWidth < 17) {
        currentInventory.width = newWidth
    }

    let newHeight = Number(inventoryHeightElement.value)
    if (!isNaN(newHeight) && newHeight > 0 && newHeight < 17) {
        currentInventory.height = newHeight
    }

    currentInventory.visualize()
}

function preventDrop(evt) {
    evt.preventDefault()
}

function alertText(text, isError, time) {
    alertElement.innerText = text
    if (isError) {
        alertElement.classList.add("errorAlert")
    } else {
        alertElement.classList.remove("errorAlert")
    }
    alertElement.classList.add("alertOn")
    setTimeout(function () {
        alertElement.classList.remove("alertOn")
    }, time * 1000)
}

const readBinaryFile = async (file) => {
    const buffer = await file.arrayBuffer()
    let success = currentInventory.fromBuffer(buffer)
    if (success === true) {
        currentInventory.visualize()
        alertText("Successfully loaded inventory", false, 1)
    } else {
        alertText(success, true, 3)
    }
}

let imagesToLoad = [
    "assets/itemTilesets/Actor_Blank.png",
    "assets/itemTilesets/BuffIcons_3.png",
    "assets/itemTilesets/Item_Among_Us.png",
    "assets/itemTilesets/Item_Classes_And_Combat.png",
    "assets/itemTilesets/Item_Dungeon_Desert.png",
    "assets/itemTilesets/Item_Dungeon_Forest.png",
    "assets/itemTilesets/Item_Dungeon_Ice.png",
    "assets/itemTilesets/Item_Ice.png",
    "assets/itemTilesets/Item_Lava_Biome.png",
    "assets/itemTilesets/Item_Lava_Dungeon.png",
    "assets/itemTilesets/Item_NPC_Update.png",
    "assets/itemTilesets/Item_Shovel_Update.png",
    "assets/itemTilesets/Item_Upgrade_Materials.png",
    "assets/itemTilesets/Item_Void_Dungeon.png",
    "assets/itemTilesets/Item_Volcano_Mini_Dungeons.png",
    "assets/itemTilesets/Items_Desert.png",
    "assets/itemTilesets/Items_Farming.png",
    "assets/itemTilesets/Items_Fishing.png",
    "assets/itemTilesets/Items_Forest.png",
    "assets/itemTilesets/Items_Halloween.png",
    "assets/itemTilesets/Items_Housing.png",
    "assets/itemTilesets/Items_Lunar_New_Year.png",
    "assets/itemTilesets/Items_Summer.png",
    "assets/itemTilesets/Items.png",
    "assets/itemTilesets/Items2.png",
    "assets/itemTilesets/Skeleton.png",
    "assets/itemTilesets/Tileset_Forest.png",
    "assets/itemTilesets/Tileset_Mines.png",
    "assets/itemTilesets/Tileset_Transportation_Items.png"
]

var images = {}

let loadedImages = 0

//load images
if (INCLUDES_TILESETS) {
    for (let i = 0; i < imagesToLoad.length; i++) {
        images[imagesToLoad[i]] = new Image()
        images[imagesToLoad[i]].addEventListener("load", function(e) {
            loadedImages += 1
            if (loadedImages >= imagesToLoad.length) {
                updateSearch()
            }
        })
        images[imagesToLoad[i]].src = imagesToLoad[i]
    }
}

importInput.addEventListener("change", () => {
    let file = importInput.files[0]
    if (file) {
        readBinaryFile(file)
    }
})

exportButton.addEventListener("click", () => {
    currentInventory.saveAsFile()
})

helpButton.addEventListener("click", () => {
    document.getElementById("dialog-help").showModal()
})

closeDialogButton.addEventListener("click", () => {
    document.getElementById("dialog-help").close()
})

//add categories
let categories = assetInfoHelper.getExistingCategories()
for (let i = 0; i < categories.length; i++) {
    let option = document.createElement("option")
    option.value = categories[i]
    option.innerText = categories[i]

    itemListCategory.appendChild(option)
}

//dropping on item list deletes item
itemList.ondragover = function(evt) {
    evt.preventDefault()
}
itemList.ondrop = function(evt) {
    let originalSlot = evt.dataTransfer.getData("originalSlot")
    if (originalSlot) {
        currentInventory.removeItemAtSlot(originalSlot)
        currentInventory.visualize()
    }
}

function setSlotSize(size) {
    let rootElement = document.querySelector(":root")
    rootElement.style.setProperty("--slot-size", size + "px")
    slotSize = size
}

function updateSearch() {
    setTimeout(function() {
        let search = document.getElementById("item-list-searchbar").value
        let category = document.getElementById("item-list-category").value
    
        let searchItems = assetInfoHelper.findInfosBySearch(search)
    
        let resultItems = JSON.parse(JSON.stringify(searchItems))
    
        /*if (search === "") {
            resultItems = JSON.parse(JSON.stringify(assetInfo))
        }*/
    
        if (category !== "") {
            let newResultItems = []
            for (i in resultItems) {
                if (resultItems[i].category === category) {
                    newResultItems.push(resultItems[i])
                }
            }
            resultItems = JSON.parse(JSON.stringify(newResultItems))
        }
    
        //clear item list
        itemList.innerHTML = ""
    
        //add items
        for (let i in resultItems) {
            let itemInfo = resultItems[i]
    
            if (itemInfo) {
                //the slot
                let slot = document.createElement("div")
                slot.classList.add("list-slot")
                slot.draggable = true
    
                slot.ondragstart = function(evt) {
                    evt.dataTransfer.setData("uniqueID", itemInfo.uniqueID)
                }

                slot.currentItemId = itemInfo.uniqueID
    
                //add image
                let itemImage = document.createElement("img")
                itemImage.classList.add("inventory-item-image")
                itemImage.src = "assets/transparent.png"
                itemImage.draggable = false

                //title for when hovering over image
                let itemTitle = (itemInfo.name || itemInfo.localizedName) + "#" + itemInfo.uniqueID
                if (itemInfo.category != "") {
                    itemTitle = itemTitle + " (" + itemInfo.category + ")"
                }
                slot.alt = itemTitle
                slot.title = itemTitle

                //loading image
                if (itemInfo.tileset != "" && itemInfo.tileset != undefined && INCLUDES_TILESETS) {
                    let image = images[`assets/itemTilesets/${itemInfo.tileset}.png`]
    
                    //calculate spritesheet size and position
                    console.log(`assets/itemTilesets/${itemInfo.tileset}.png`)
                    let backgroundSizeX = (image.naturalWidth / itemInfo.rectW) * slotSize
                    let backgroundSizeY = (image.naturalHeight / itemInfo.rectH) * slotSize
    
                    let backgroundPosX = (backgroundSizeX / image.naturalWidth) * itemInfo.rectX
                    let backgroundPosY = (backgroundSizeY / image.naturalHeight) * (image.naturalHeight - itemInfo.rectY - itemInfo.rectH)
    
                    itemImage.style = `background-image: url(assets/itemTilesets/${itemInfo.tileset}.png); background-position: -${backgroundPosX}px -${backgroundPosY}px; background-size: ${backgroundSizeX}px ${backgroundSizeY}px;`
                } else { //set it to unknown image
                    itemImage.src = "assets/unknown.png"
                }

                if (!INCLUDES_TILESETS) {
                    itemImage.style = "height: 0px;"
                    itemImage.src = "assets/transparent.png"
                }
    
                let itemText = document.createElement("span")
                itemText.classList.add("item-name")
                itemText.innerText = itemInfo.localizedName || itemInfo.name
    
                slot.appendChild(itemImage)
                slot.appendChild(itemText)
                itemList.appendChild(slot)
            }
        }

        if (Math.abs(resultItems.length) !== 1) {
            itemListResultCount.innerText = resultItems.length + " results"
        } else {
            itemListResultCount.innerText = resultItems.length + " result"
        }
    },10)
}

updateSearch()

function update() {
    let rootElement = document.querySelector(":root")
    rootElement.style.setProperty("--screen-width", window.innerWidth + "px")

    window.requestAnimationFrame(update)
}

update()
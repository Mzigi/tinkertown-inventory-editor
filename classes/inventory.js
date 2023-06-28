"use-strict";
/*
INVENTORY

width: byte
height: byte
target: byte (only supports 1) (idk what this is)

containsItems: int16 (bool)
totalSlots: int16 (used for itemList length)

itemDataList: ITEM
*/

/*
ITEM
itemId: int16
itemCount: int16
slot: byte (because this is a byte max inventory size is 16x16 if you want to save properly)
*/

var saveByteArray = (function () {
    var a = document.createElement("a");
    document.body.appendChild(a);
    a.style = "display: none";
    return function (data, name) {
        var blob = new Blob(data, {type: "octet/stream"}),
            url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = name;
        a.click();
        window.URL.revokeObjectURL(url);
    };
}());

class Inventory {
    constructor() {
        this.width = 5
        this.height = 5
        this.target = 1

        this.containsItems = 0
        this.totalSlots = 0

        this.itemDataList = []
    }

    reset() {
        this.width = 5
        this.height = 5
        this.target = 1

        this.containsItems = 0
        this.totalSlots = 0

        this.itemDataList = []
        this.visualize()
    }

    fromBuffer(inventoryBuffer) {
        try {
            //clear everything
            this.itemDataList = []

            this.width = 5
            this.height = 5
            this.target = 0
            
            this.containsItems = 0
            this.totalSlots = 0

            //actual loading
            let view = new simpleView(inventoryBuffer)
            
            this.width = view.readUint8()
            this.height = view.readUint8()
            this.target = view.readUint8()

            if (this.target !== 1) {
                console.warn("Inventory is incompatible!")
                this.reset()
                return "This isn't a player inventory file!"
            }

            this.containsItems = view.readInt16()
            if (this.containsItems) {
                this.totalSlots = view.readInt16()

                for (let i = 0; i < this.totalSlots; i++) {
                    let begin = 7 + i * 5
                    let end = begin + 5

                    let itemData = new Item()
                    itemData.fromBuffer(inventoryBuffer.slice(begin,end))

                    if (!assetInfo[itemData.id]) {
                        if (INCLUDES_TILESETS) {
                            alert("Item with id " + itemData.id + " is missing from the database and will be deleted")
                        } else {
                            assetInfo[itemData.id] = {"uniqueID": itemData.id, "typeNumber": 0, "name": "#" + itemData.id, "localizedName": "#" + itemData.id, "description": "Unknown item with id #" + itemData.id, "localizedDescription": "Unknown item with id #" + itemData.id, "category": "Unused", "maxStacks": 99, "isKey": false}
                        }
                    }

                    this.itemDataList.push(itemData)
                }
            }

            return true
        } catch (error) {
            this.reset()
            return error
        }
    }

    writeToBuffer(writeBuffer, byteOffset) {
        try {
            let view = new simpleView(writeBuffer)
            view.viewOffset = byteOffset

            view.writeUint8(this.width)
            view.writeUint8(this.height)
            view.writeUint8(this.target)

            view.writeInt16(this.containsItems)
            
            view.writeInt16(this.totalSlots)
            for (let i = 0; i < this.totalSlots; i++) {
                let itemByteOffset = 7 + i * 5
                this.itemDataList[i].writeToBuffer(writeBuffer, itemByteOffset)
            }
        } catch (error) {
            alertText(error, true, 3)
        }
    }

    getByteSize() {
        return 7 + this.totalSlots * 5
    }

    saveAsFile() {
        this.validateItems()
        let inventoryBuffer = new ArrayBuffer(this.getByteSize())
        this.writeToBuffer(inventoryBuffer, 0)
        saveByteArray([inventoryBuffer], "inventory.dat")
    }

    checkContainsItems() {
        if (this.itemDataList.length > 0) {
            this.containsItems = 1
        } else {
            this.containsItems = 0
        }
    }

    validateItems() {
        let toSplice = []
        for (let i = 0; i < this.itemDataList.length; i++) {
            if ((this.itemDataList[i].slot + 1) > (this.width * this.height)) {
                toSplice.push(i)
            }
        }

        for (let i = toSplice.length - 1; i > -1; i--) {
            this.itemDataList.splice(toSplice[i],1)
        }

        this.totalSlots = this.itemDataList.length
        this.checkContainsItems()
    }

    setIdAtSlot(slot, id) {
        for (let i = 0; i < this.itemDataList.length; i++) {
            let item = this.itemDataList[i]
            if (item.slot == slot) {
                item.id = Number(id)
                return
            }
        }
        
        let item = new Item()
        item.id = Number(id)
        item.slot = Number(slot)
        this.itemDataList.push(item)
        this.totalSlots = this.itemDataList.length
        this.checkContainsItems()
    }

    setCountAtSlot(slot, count) {
        for (let i = 0; i < this.itemDataList.length; i++) {
            let item = this.itemDataList[i]
            if (item.slot == slot) {
                item.count = Number(count)
                return
            }
        }

        let item = new Item()
        item.count = Number(count)
        item.slot = Number(slot)
        this.itemDataList.push(item)
        this.totalSlots = this.itemDataList.length
        this.checkContainsItems()
    }

    removeItemAtSlot(slot) {
        for (let i = 0; i < this.itemDataList.length; i++) {
            let item = this.itemDataList[i]
            if (item.slot == slot) {
                this.itemDataList.splice(i, 1)
            }
        }
        this.totalSlots = this.itemDataList.length
        this.checkContainsItems()
    }

    getItemAtSlot(slot) {
        for (let i = 0; i < this.itemDataList.length; i++) {
            let item = this.itemDataList[i]
            if (item.slot == slot) {
                return item
            }
        }
    }

    visualize() {
        //find elements
        let rootElement = document.querySelector(":root")

        let inventoryElement = document.getElementById("inventory")
        inventoryElement.innerHTML = ""

        //set variables
        rootElement.style.setProperty("--inventory-width", this.width)

        //set width and height element
        let invWidthElement = document.getElementById("inventory-width")
        let invHeightElement = document.getElementById("inventory-height")
        invWidthElement.value = this.width
        invHeightElement.value = this.height

        //set correct columns
        let columnsString = ""
        for (let i = 0; i < this.width; i++) {
            if (i === 0) {
                columnsString += "auto"
            } else {
                columnsString += " auto"
            }
        }
        rootElement.style.setProperty("--inventory-columns", columnsString)
        
        //add slots
        for (let i = 0; i < this.width * this.height; i++) {
            let slot = document.createElement("div")
            slot.setAttribute("id", "slot" + i)
            slot.setAttribute("slot", i)
            if (INCLUDES_TILESETS) {
                slot.classList.add("slot")
            } else {
                slot.classList.add("slot-adaptive-height")
            }

            let inventory = this

            //slot dropped event listener
            slot.ondrop = function(evt) {
                let originalId = evt.dataTransfer.getData("uniqueID")
                let originalSlot = evt.dataTransfer.getData("originalSlot")
                let originalCount = evt.dataTransfer.getData("originalCount")

                let currentSlot = slot.getAttribute("slot")

                if (originalSlot) { //if dragging one item in inventory to another place
                    let currentItem = inventory.getItemAtSlot(currentSlot)

                    if (currentItem) {
                        let currentId = currentItem.id
                        let currentCount = currentItem.count

                        inventory.setIdAtSlot(currentSlot, originalId)
                        inventory.setCountAtSlot(currentSlot, originalCount)

                        inventory.setIdAtSlot(originalSlot, currentId)
                        inventory.setCountAtSlot(originalSlot, currentCount)
                    } else {
                        inventory.removeItemAtSlot(originalSlot)
                        inventory.setIdAtSlot(currentSlot, originalId)
                        inventory.setCountAtSlot(currentSlot, originalCount)
                    }
                } else { //if youre dragging from item list
                    inventory.setIdAtSlot(currentSlot, originalId)
                    inventory.setCountAtSlot(currentSlot, 1)
                }
                inventory.visualize()
            }
            slot.ondragover = function(evt) {
                evt.preventDefault()
            }
            slot.innerHTML = `<input class="item-amount" type="number" placeholder="0" onkeypress='validateNumberInput(event)' ondrop="preventDrop(event)" hidden>`

            inventoryElement.appendChild(slot)
        }

        //add items
        for (let i = 0; i < this.totalSlots; i++) {
            let item = this.itemDataList[i]
            let itemInfo = assetInfo[item.id]

            if (itemInfo) {
                let slotElement = document.getElementById("slot" + item.slot)
                if (slotElement) {
                    slotElement.classList.add("contains-item")
                    slotElement.draggable = true
                    slotElement.setAttribute("uniqueID", itemInfo.uniqueID)
                    slotElement.ondragstart = function(evt) {
                        evt.dataTransfer.setData("uniqueID", itemInfo.uniqueID)
                        evt.dataTransfer.setData("originalSlot", item.slot)
                        evt.dataTransfer.setData("originalCount", item.count)
                    }
                    
                    let itemAmountElement = slotElement.querySelector(".item-amount")
                    itemAmountElement.hidden = false
                    itemAmountElement.value = item.count

                    //item amount change event listener
                    let inventory = this
                    itemAmountElement.addEventListener("change", function(e) {
                        inventory.setCountAtSlot(item.slot, Number(itemAmountElement.value))
                    })

                    //add image
                    let itemImage = document.createElement("img")
                    itemImage.classList.add("inventory-item-image")
                    itemImage.src = "assets/transparent.png"
                    itemImage.draggable = false
                    itemImage.alt = (itemInfo.name || itemInfo.localizedName) + "#" + itemInfo.uniqueID
                    itemImage.title = (itemInfo.name || itemInfo.localizedName) + "#" + itemInfo.uniqueID
                    if (itemInfo.tileset != "" && itemInfo.tileset != undefined && INCLUDES_TILESETS) {
                        let image = images[`assets/itemTilesets/${itemInfo.tileset}.png`]

                        //calculate spritesheet size and position
                        let backgroundSizeX = (image.naturalWidth / itemInfo.rectW) * slotSize
                        let backgroundSizeY = (image.naturalHeight / itemInfo.rectH) * slotSize

                        let backgroundPosX = (backgroundSizeX / image.naturalWidth) * itemInfo.rectX
                        let backgroundPosY = (backgroundSizeY / image.naturalHeight) * (image.naturalHeight - itemInfo.rectY - itemInfo.rectH)

                        itemImage.style = `background-image: url(assets/itemTilesets/${itemInfo.tileset}.png); background-position: -${backgroundPosX}px -${backgroundPosY}px; background-size: ${backgroundSizeX}px ${backgroundSizeY}px;`
                    } else { //set it to unknown image
                        itemImage.src = "assets/unknown.png"
                    }

                    if (!INCLUDES_TILESETS) {
                        itemImage.style = "height: 20px;"
                        itemImage.src = "assets/transparent.png"
                        slotElement.alt = (itemInfo.name || itemInfo.localizedName) + "#" + itemInfo.uniqueID
                        slotElement.title = (itemInfo.name || itemInfo.localizedName) + "#" + itemInfo.uniqueID
                    }

                    slotElement.appendChild(itemImage)

                    if (!INCLUDES_TILESETS) {
                        let itemText = document.createElement("span")
                        itemText.classList.add("item-name")
                        itemText.innerText = itemInfo.localizedName || itemInfo.name
                        slotElement.appendChild(itemText)
                    }
                }
            } else {
                alert("Item with id " + item.id + " is missing from the database and will be deleted")
            }
        }
    }
}
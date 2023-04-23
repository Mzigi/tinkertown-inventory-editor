let saveButton = document.getElementById("save")
let loadButton = document.getElementById("load")
let fileChooser = document.getElementById("choose-file")

saveButton.addEventListener("mousedown", () => {
    //[id 16-bit, count 16-bit, slot (0-24)]
    let itemList = []

    //loop trough all slots
    for (let i = 0; i < 25; i++) {
        let slot = document.getElementById("slot" + i.toString())
        let itemAmount = slot.querySelector(".item-amount").value
        let itemId = slot.querySelector(".item-id").value

        if (itemAmount === "") {
            itemAmount = "1"
        }

        itemId = Number(itemId)
        itemAmount = Number(itemAmount)

        //cant be bigger than 65535
        itemId = Math.min(65535,itemId)
        itemAmount = Math.min(65535,itemAmount)

        //cant be smaller than 0
        itemId = Math.max(0,itemId)
        itemAmount = Math.max(0,itemAmount)

        if (itemId !== 0) {
            let itemArray = [itemId, itemAmount, i]
            itemList.push(itemArray)
        }
    }

    encodeInventory(itemList)
})

const readBinaryFile = async (file) => {
    const buffer = await file.arrayBuffer()
    let inventoryArray = decodeInventory(buffer)
}

loadButton.addEventListener("mousedown",() => {
    const file = fileChooser.files[0]
    if (file) {
        readBinaryFile(file)
    }
})
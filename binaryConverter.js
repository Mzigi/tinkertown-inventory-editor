/*
0. always 05?
1. always 05?
2. always 01?
possibly based on version ^

3. bool, if inventory contains items
4. 00
5. total slots used
6. 00

--repeats items after this (5 bytes)
0. item id 16-bit
1. ^
2. item count 16-bit
3. ^
4. which slot item is in (0-24)

--item id list
0. UNDEFINED
1. Stone Brick (Missing Icon)
2. Coal
3. Copper Bar
4. Copper Ore
5. Emerald (Missing Icon)
6. Glass Bottle
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

function encodeInventory(array) {
    let bufferLength = 7 + array.length * 5
    let buffer = new ArrayBuffer(bufferLength)
    
    let view = new Uint8Array(buffer)
    //version?
    view[0] = 5
    view[1] = 5
    view[2] = 1

    //random info
    view[3] = array.length > 0
    view[4] = 0
    view[5] = array.length
    view[6] = 0

    let viewPosition = 7

    //items
    for (let i = 0; i < array.length; i++) {
        console.log(array[i])

        let item = array[i]
        let itemId = item[0]
        let itemAmount = item[1]
        let itemSlot = item[2]

        console.log(itemSlot)

        //5 bytes
        view[viewPosition] = itemId
        viewPosition++
        view[viewPosition] = 0
        viewPosition++
        view[viewPosition] = itemAmount
        viewPosition++
        view[viewPosition] = 0
        viewPosition++
        view[viewPosition] = itemSlot
        viewPosition++
    }

    saveByteArray([view],"inventory.dat")
}

function decodeInventory(buffer) {
    console.log(buffer)
    let view = new Uint8Array(buffer)
    let bufferLength = view.length

    if (view[3] === 1) {
        console.log("Inventory contains items")
        let itemCount = view[5]
        console.log("Inventory contains " + itemCount + " items")

        let viewPosition = 7

        for (let i = 0; i < itemCount; i++) {
            let itemId = view[viewPosition]
            viewPosition++
            viewPosition++
            let itemAmount = view[viewPosition]
            viewPosition++
            viewPosition++
            let itemSlot = view[viewPosition]
            viewPosition++

            let slotElement = document.getElementById("slot" + itemSlot)
            let itemAmountElement = slotElement.querySelector(".item-amount")
            let itemIdElement = slotElement.querySelector(".item-id")

            itemAmountElement.value = itemAmount.toString()
            itemIdElement.value = itemId.toString()

            console.log(slotElement)
            console.log(itemId)
            console.log(itemAmount)
            console.log(itemSlot)
        }
    } else {
        console.log("Empty inventory")
    }
}

document.encodeInventory = encodeInventory
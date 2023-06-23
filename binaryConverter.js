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

function getHighLow(number) {
    let high = ((number >> 8) & 0xff);
    let low = number & 0xff;

    return [low,high]
}

function correctNumber(high,low) {
    return (((high & 0xff) << 8) | (low & 0xff))
}

function encodeInventory(array) {
    let bufferLength = 7 + array.length * 5
    let buffer = new ArrayBuffer(bufferLength)
    
    let view = new Uint8Array(buffer)
    //width
    view[0] = 5
    //height
    view[1] = 5
    //format?
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

        //item id
        if (itemId <= 255) {
            view[viewPosition] = itemId
            viewPosition++
            view[viewPosition] = 0
            viewPosition++
        } else {
            let highAndLow = getHighLow(itemId)
            let high = highAndLow[1]
            let low = highAndLow[0]

            view[viewPosition] = low
            viewPosition++
            view[viewPosition] = high
            viewPosition++
        }
        //item amount
        if (itemId <= 255) {
            view[viewPosition] = itemAmount
            viewPosition++
            view[viewPosition] = 0
            viewPosition++
        } else {
            let highAndLow = getHighLow(itemAmount)
            let high = highAndLow[1]
            let low = highAndLow[0]

            view[viewPosition] = low
            viewPosition++
            view[viewPosition] = high
            viewPosition++
        }
        view[viewPosition] = itemSlot
        viewPosition++
    }

    console.log(view)

    saveByteArray([view],"inventory.dat")
}

function decodeInventory(buffer) {
    console.log(buffer)
    let view = new Uint8Array(buffer)
    let bufferLength = view.length

    let isIncompatible = false

    if (view[3] === 1) {
        console.log("Inventory contains items")
        let itemCount = view[5]
        console.log("Inventory contains " + itemCount + " items")

        let viewPosition = 7

        //clear inventory editor
        for (let i = 0; i < 25; i++) {
            let slotElement = document.getElementById("slot" + i)
            console.log(slotElement)
            let itemAmountElement = slotElement.querySelector(".item-amount")
            let itemIdElement = slotElement.querySelector(".item-id")

            itemAmountElement.value = ""
            itemIdElement.value = ""
        }

        //load the actual stuff
        for (let i = 0; i < itemCount; i++) {
            let itemId = view[viewPosition]
            viewPosition++
            if (view[viewPosition] !== 0) {
                console.log("original id: " + itemId)
                itemId = correctNumber(view[viewPosition],itemId)
                console.log("corrected id: " + itemId)
                isIncompatible = true
            }
            viewPosition++
            let itemAmount = view[viewPosition]
            viewPosition++
            if (view[viewPosition] !== 0) {
                itemAmount = correctNumber(view[viewPosition],itemAmount)
                isIncompatible = true
            }
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

    if (isIncompatible) {
        //alert("WARNING: Inventory contains one or more items that go beyond the id limit of 255, at least one item can't be saved properly")
    }
}

document.encodeInventory = encodeInventory
"use-strict";

class simpleView {
    constructor (buffer) {
        this.view = new DataView(buffer)
        this.viewOffset = 0
    }

    writeInt16(value, littleEdian) {
        if (!littleEdian) {
            littleEdian = true
        }

        value = Math.max(value, -32768)
        value = Math.min(value, 32767)

        this.view.setInt16(this.viewOffset, value, littleEdian)
        this.viewOffset += 2
    }

    readInt16(littleEdian) {
        if (!littleEdian) {
            littleEdian = true
        }

        let value = this.view.getInt16(this.viewOffset, littleEdian)
        this.viewOffset += 2
        
        return value
    }

    writeUint8(value, littleEdian) {
        if (!littleEdian) {
            littleEdian = true
        }

        value = Math.max(value, 0)
        value = Math.min(value, 255)

        this.view.setUint8(this.viewOffset, value, littleEdian)
        this.viewOffset += 1
    }

    readUint8(littleEdian) {
        if (!littleEdian) {
            littleEdian = true
        }

        let value = this.view.getUint8(this.viewOffset, littleEdian)
        this.viewOffset += 1
        
        return value
    }
}
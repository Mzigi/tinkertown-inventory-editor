# tinkertown-inventory-editor

**#Where are the inventory files stored?**

\Users\YOUR_USER\AppData\LocalLow\Headup\Tinkertown\characters\YOUR_CHARACTER\inventory.dat

**##How to load inventory files?**

Click "choose files" on the top, find you inventory.dat file, then click the "Load" button next to the "choose files" button

**##How do I find an item's id?**

If you're on windows press Control + F to search for the item you want and look for it in the id list, 
when you have found the item just type the number next to it in an inventory slot you want it in

Note: Not all items are listed on the id list

**##How do I save?**

Click "Save" on the top, rename the file to "inventory.dat" if it has a different name, find where your character's inventory file is
and drag and drop the "inventory.dat" file you just saved into the character folder and replace the original inventory.dat

Note: You should backup your inventory file before doing this because things could go wrong

**##Limitations**

* No numbers can be over 255, this includes item id's and item amounts even if an item with an id
bigger than 255 exists
* I have no idea what happens if you try to put a decimal number, just don't
* I also don't know what happens if you load an inventory and it has 255+ of something, it will likely just set it to 255

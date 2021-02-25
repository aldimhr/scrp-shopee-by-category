'use strict';

// puppeteer
const puppeteer = require('puppeteer')

(async () => {

    // loop max page
    for (let i = 0; i < 99; i++) {
        console.log('\n--------------------------------------------')
        console.log('PAGE ' + (i + 1) + ' PAGE ' + (i + 1) + ' PAGE ' + (i + 1) + ' PAGE ' + (i + 1) + ' PAGE ' + (i + 1) + ' PAGE ' + (i + 1))
        console.log('--------------------------------------------\n')

        try {

            /*
            ==============================================
                        get all items in one page
            ==============================================
            
            itemid
            shopid          
            link          
            */

            // puppeteer
            let browser = await puppeteer.launch({
                // headless: false,
                headless: true,
                // slowMo: 250,
                args: [
                    // '--start-maximized',
                    '--headless',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-accelerated-2d-canvas',
                    '--disable-gpu',
                    '--no-first-run',
                    '--no-sandbox',
                    '--no-zygote',
                    "--incognito",
                    "--single-process",
                ],
            })
            const [page] = await browser.pages();

            // category items in one page
            let catItems = []

            // category link
            await page.goto('https://shopee.co.id/Atasan-cat.32.819?page=' + i)

            // get response body
            page.on('response', response => {

                if (response.url().includes("?by=relevancy&limit=50&match_id=819&newest=")) {

                    response.text().then(function (textBody) {
                        catItems[0] = textBody
                    })
                }
            })

            await page.waitForXPath("//div[contains(text(), 'Populer')]")

            if (catItems[0] == null || catItems[0] == undefined) {

                // close browser
                await browser.close();

                i--
                console.log('Request category page not found, loop again')
                continue
            }

            // variable items
            let allData = await JSON.parse(catItems[0])
            allData = allData.items

            // print data length
            console.log('Total data: ' + allData.length)

            // loop item length
            for (let j = 0; j < allData.length; j++) {

                try {

                    // get data
                    let itemid = allData[j].itemid
                    let shopid = allData[j].shopid
                    let link

                    // filter link
                    let f_name = allData[j].name
                    f_name = f_name.replace(/[^\w\s]/gi, ' ')
                    f_name = f_name.replace(/\s{2,}/g, ' ')
                    f_name = f_name.replace(/\s/g, '-')
                    link = 'https://shopee.co.id/' + f_name + '-i.' + shopid + '.' + itemid

                    // item data var
                    let itemsData = []

                    // go to link
                    page.goto(link)

                    // get response body
                    page.on('response', response => {

                        // response prod information
                        if (response.url().includes("https://shopee.co.id/api/v2/item/get?itemid=")) {

                            response.text().then(function (textBody) {
                                itemsData[0] = textBody
                            })
                        }

                        // response shop information
                        if (response.url().includes("get_shop_info?shopid=")) {

                            // console.log('data 2 founded')

                            response.text().then(function (textBody) {
                                itemsData[1] = textBody
                            })
                        }
                    })

                    // wait
                    await page.waitForXPath("//a[contains(text(), 'kunjungi toko')]")

                    // if response not found
                    if (itemsData[0] == null || itemsData[0] == undefined || itemsData[1] == null || itemsData[1] == undefined) {
                        j--
                        console.log('Request not found, loop again')
                        continue
                    }

                    /*
                    ==============================================
                    get data per item
                    ==============================================
                
                    price
                    categories[]
                    name_product
                    rating
                    image
                    liked_count
                    view_count
                    shop_location
                    sold
                    */

                    let data = await JSON.parse(itemsData[0])
                    data = data.item

                    // data
                    let price = data.price_max / 100000
                    let category = []
                    let name_product = data.name
                    let rating = (data.item_rating.rating_star).toFixed(1)
                    let image = 'https://cf.shopee.co.id/file/' + data.image
                    let liked_count = data.liked_count
                    let view_count = data.view_count
                    let shop_location = data.shop_location
                    let sold = data.historical_sold

                    // filter category
                    data['categories'].forEach(element => {
                        category.push(element.display_name)
                    });


                    /*
                    =======================
                        shop name
                    =======================
                    
                    user_name
                    shop_name   
                    */

                    // parse shop response
                    let shop = await JSON.parse(itemsData[1])

                    // data
                    let username = shop.data.account.username
                    let shopname = shop.data.name

                    console.log('link: ' + link)
                    console.log('username: ' + username)
                    console.log('itemid: ' + itemid)
                    console.log('shopid: ' + shopid)
                    console.log('image: ' + image)
                    console.log('shopname: ' + shopname)
                    console.log('category: ' + category)
                    console.log('name_product: ' + name_product)
                    console.log('sold: ' + sold)
                    console.log('liked_count: ' + liked_count)
                    console.log('view_count: ' + view_count)
                    console.log('shop_location: ' + shop_location)
                    console.log('price: ' + price)
                    console.log('rating: ' + rating)
                    console.log('\n' + (j + 1) + '------------------\n')

                } catch (err) {
                    console.log(err)
                }
            }

            // close browser
            await browser.close();

        } catch (err) {
            console.log(err)
        }
    }
})()
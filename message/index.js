/**
 * This source code below is free, please DO NOT sell this in any form!
 * Source code ini gratis, jadi tolong JANGAN jual dalam bentuk apapun!
 * 
 * If you want to contributing to this source code, pull requests are always open.
 * Apabila kamu ingin berkontribusi ke source code ini, pull request selalu kami buka.
 * 
 * Thanks for the contributions.
 * Terima kasih atas kontribusinya.
 */

/********** MODULES **********/
const { decryptMedia, Client } = require('@open-wa/wa-automate')
const fs = require('fs-extra')
const config = require('../config.json')
const Nekos = require('nekos.life')
const neko = new Nekos()
const os = require('os')
const nhentai = require('nhentai-js')
const { API } = require('nhentai-api')
const api = new API()
const sagiri = require('sagiri')
const crypto = require('crypto')
const tts = require('node-gtts')
const bent = require('bent')
const ms = require('parse-ms')
const canvas = require('canvacord')
const mathjs = require('mathjs')
const saus = sagiri(config.nao, { results: 5 })
const moment = require('moment-timezone')
moment.tz.setDefault('Asia/Jakarta').locale('id')
/********** END OF MODULES **********/

/********** UTILS **********/
const { msgFilter, color, processTime, isUrl } = require('../tools')
const { nsfw, weeaboo, downloader, sticker, fun, misc } = require('../lib')
const { uploadImages } = require('../tools/fetcher')
const { ind, eng } = require('./text/lang/')
const cd = 4.32e+7
const errorImg = 'https://i.imgur.com/UxvMPUz.png'
const tanggal = moment.tz('Asia/Jakarta').format('YYYY-MM-DD')
/********** END OF UTILS **********/

/********** DATABASES **********/
const _nsfw = JSON.parse(fs.readFileSync('./database/nsfw.json'))
const _ban = JSON.parse(fs.readFileSync('./database/banned.json'))
const _premium = JSON.parse(fs.readFileSync('./database/premium.json'))
const _registered = JSON.parse(fs.readFileSync('./database/registered.json'))
const _antilink = JSON.parse(fs.readFileSync('./database/antilink.json'))
const _leveling = JSON.parse(fs.readFileSync('./database/leveling.json'))
const _welcome = JSON.parse(fs.readFileSync('./database/welcome.json'))
const _level = JSON.parse(fs.readFileSync('./database/level.json'))
const _limit = JSON.parse(fs.readFileSync('./database/limit.json'))
const _afk = JSON.parse(fs.readFileSync('./database/afk.json'))
const _autostiker = JSON.parse(fs.readFileSync('./database/autostiker.json'))
/********** END OF DATABASES **********/

/********** MESSAGE HANDLER **********/
module.exports = msgHandler = async (bocchi = new Client(), message) => {
    try {
        const { type, id, from, t, sender, isGroupMsg, chat, caption, isMedia, mimetype, quotedMsg, quotedMsgObj, mentionedJidList } = message
        let { body } = message
        const { name, formattedTitle } = chat
        let { pushname, verifiedName, formattedName } = sender
        pushname = pushname || verifiedName || formattedName
        const botNumber = await bocchi.getHostNumber() + '@c.us'
        const blockNumber = await bocchi.getBlockedIds()
        const ownerNumber = config.ownerBot
        const groupId = isGroupMsg ? chat.groupMetadata.id : ''
        const groupAdmins = isGroupMsg ? await bocchi.getGroupAdmins(groupId) : ''
        const time = moment(t * 1000).format('DD/MM/YY HH:mm:ss')

        const chats = (type === 'chat') ? body : ((type === 'image' || type === 'video')) ? caption : ''
        const prefix  = config.prefix
        body = (type === 'chat' && body.startsWith(prefix)) ? body : (((type === 'image' || type === 'video') && caption) && caption.startsWith(prefix)) ? caption : ''
        const command = body.slice(1).trim().split(/ +/).shift().toLowerCase()
        const args = body.trim().split(/ +/).slice(1)
        const isCmd = body.startsWith(prefix)
        const uaOverride = config.uaOverride
        const q = args.join(' ')
        const ar = args.map((v) => v.toLowerCase())
        const url = args.length !== 0 ? args[0] : ''
        
        /********** FUNCTION **********/
        const getLevelingXp = (userId) => {
            let position = false
            Object.keys(_level).forEach((i) => {
                if (_level[i].id === userId) {
                    position = i
                }
            })
            if (position !== false) {
                return _level[position].xp
            }
        }

        const getLevelingLevel = (userId) => {
            let position = false
            Object.keys(_level).forEach((i) => {
                if (_level[i].id === userId) {
                    position = i
                }
            })
            if (position !== false) {
                return _level[position].level
            }
        }

        const getLevelingId = (userId) => {
            let position = false
            Object.keys(_level).forEach((i) => {
                if (_level[i].id === userId) {
                    position = i
                }
            })
            if (position !== false) {
                return _level[position].id
            }
        }

        const addLevelingXp = (userId, amount) => {
            let position = false
            Object.keys(_level).forEach((i) => {
                if (_level[i].id === userId) {
                    position = i
                }
            })
            if (position !== false) {
                _level[position].xp += amount
                fs.writeFileSync('./database/level.json', JSON.stringify(_level))
            }
        }

        const addLevelingLevel = (userId, amount) => {
            let position = false
            Object.keys(_level).forEach((i) => {
                if (_level[i].id === userId) {
                    position = i
                }
            })
            if (position !== false) {
                _level[position].level += amount
                fs.writeFileSync('./database/level.json', JSON.stringify(_level))
            }
        }

        const addLevelingId = (userId) => {
            const obj = {id: userId, xp: 1, level: 1}
            _level.push(obj)
            fs.writeFileSync('./database/level.json', JSON.stringify(_level))
        }

        const addLimit = (userId) => {
            const obj = {id: userId, time: Date.now()}
            _limit.push(obj)
            fs.writeFileSync('./database/limit.json', JSON.stringify(_limit))
        }

        const getLimit = (userId) => {
            let position = false
            Object.keys(_limit).forEach((i) => {
                if (_limit[i].id === userId) {
                    position = i
                }
            })
            if (position !== false) {
                return _limit[position].time
            }
        }

        const getRegisteredRandomId = () => {
            return _registered[Math.floor(Math.random() * _registered.length)].id
        }

        const addRegisteredUser = (userId, name, age, time, serial) => {
            const obj = {id: userId, name: name, age: age, time: time, serial: serial}
            _registered.push(obj)
            fs.writeFileSync('./database/registered.json', JSON.stringify(_registered))
        }

        const createSerial = (size) => {
            return crypto.randomBytes(size).toString('hex').slice(0, size)
        }

        const checkRegisteredUser = (userId) => {
            let status = false
            Object.keys(_registered).forEach((i) => {
                if (_registered[i].id === userId) {
                    status = true
                }
            })
            return status
        }

        const checkRegisteredUserFromSerial = (serial) => {
            let status = false
            Object.keys(_registered).forEach((i) => {
                if (_registered[i].serial === serial) {
                    status = true
                }
            })
            return status
        }

        const getRegisteredNameFromSerial = (serial) => {
            let position = false
            Object.keys(_registered).forEach((i) => {
                if (_registered[i].serial === serial) {
                    position = i
                }
            })
            return _registered[position].name
        }

        const getRegisteredAgeFromSerial = (serial) => {
            let position = false
            Object.keys(_registered).forEach((i) => {
                if (_registered[i].serial === serial) {
                    position = i
                }
            })
            return _registered[position].age
        }

        const getRegisteredTimeFromSerial = (serial) => {
            let position = false
            Object.keys(_registered).forEach((i) => {
                if (_registered[i].serial === serial) {
                    position = i
                }
            })
            return _registered[position].time
        }

        const getRegisteredIdFromSerial = (serial) => {
            let position = false
            Object.keys(_registered).forEach((i) => {
                if (_registered[i].serial === serial) {
                    position = i
                }
            })
            return _registered[position].id
        }

        const addAfkUser = (userId, time, reason) => {
            const obj = {id: `${userId}`, time: `${time}`, reason: `${reason}`}
            _afk.push(obj)
            fs.writeFileSync('./database/afk.json', JSON.stringify(_afk))
        }

        const checkAfkUser = (userId) => {
            let status = false
            Object.keys(_afk).forEach((i) => {
                if (_afk[i].id === userId) {
                    status = true
                }
            })
            return status
        }

        const getAfkReason = (userId) => {
            let position = false
            Object.keys(_afk).forEach((i) => {
                if (_afk[i].id === userId) {
                    position = i
                }
            })
            if (position !== false) {
                return _afk[position].reason
            }
        }

        const getAfkTime = (userId) => {
            let position = false
            Object.keys(_afk).forEach((i) => {
                if (_afk[i].id === userId) {
                    position = i
                }
            })
            if (position !== false) {
                return _afk[position].time
            }
        }

        const getAfkId = (userId) => {
            let position = false
            Object.keys(_afk).forEach((i) => {
                if (_afk[i].id === userId) {
                    position = i
                }
            })
            if (position !== false) {
                return _afk[position].id
            }
        }

        const getAfkPosition = (userId) => {
            let position = false
            Object.keys(_afk).forEach((i) => {
                if (_afk[i].id === userId) {
                    position = i
                }
            })
            return position
        }
        /********** END OF FUNCTION **********/

        /********** VALIDATOR **********/
        const isBlocked = blockNumber.includes(sender.id)
        const isOwner = sender.id === ownerNumber
        const isGroupAdmins = groupAdmins.includes(sender.id) || false
        const isBotGroupAdmins = groupAdmins.includes(botNumber) || false
        const isNsfw = isGroupMsg ? _nsfw.includes(chat.id) : false
        const isBanned = _ban.includes(sender.id)
        const isPremium = _premium.includes(sender.id)
        const isRegistered = checkRegisteredUser(sender.id)
        const isWelcomeOn = isGroupMsg ? _welcome.includes(chat.id) : false
        const isDetectorOn = isGroupMsg ? _antilink.includes(chat.id) : false
        const isLevelingOn = isGroupMsg ? _leveling.includes(chat.id) : false
        const isAutoStikerOn = isGroupMsg ? _autostiker.includes(chat.id) : false
        const isAfkOn = checkAfkUser(sender.id)
        const isQuotedImage = quotedMsg && quotedMsg.type === 'image'
        const isQuotedVideo = quotedMsg && quotedMsg.type === 'video'
        const isQuotedSticker = quotedMsg && quotedMsg.type === 'sticker'
        const isQuotedGif = quotedMsg && quotedMsg.mimetype === 'image/gif'
        const isImage = type === 'image'
        /********** END OF VALIDATOR **********/

        // Leveling [ALPHA]
        if (isGroupMsg && isRegistered && isLevelingOn && !isCmd) {
            const currentLevel = getLevelingLevel(sender.id)
            const checkId = getLevelingId(sender.id)
            try {
                if (currentLevel === undefined && checkId === undefined) {
                    addLevelingId(sender.id)
                } else {
                    const amountXp = Math.floor(Math.random() * 10) + 500
                    const requiredXp = 5000 * (Math.pow(2, currentLevel) - 1)
                    addLevelingXp(sender.id, amountXp)
                    const getXp = getLevelingXp(sender.id)
                    if (requiredXp <= getXp) {
                        addLevelingLevel(sender.id, 1)
                        await bocchi.sendText(from, `Selamat ${pushname}! Kamu naik ke level *${getLevelingLevel(sender.id)}*!`)
                    }
                }
            } catch (err) {
                console.error(err)
            }
        }
	    
        // Automate
	if (chats.includes('truth') || chats.includes('Truth')) {
            if (!isRegistered) return await bocchi.reply(from, ind.notRegistered(), id)
            fun.truth()
                .then(async (body) => {
                    const tod = body.split('\n')
                    const randomTod = tod[Math.floor(Math.random() * tod.length)]
                    await bocchi.reply(from, randomTod, id)
                })
                .catch(async (err) => {
                    console.error(err)
                    await bocchi.reply(from, `Error!\n${err}`, id)
                })
        }
	    
        if (chats.includes('dare') || chats.includes('Dare')) {
            if (!isRegistered) return await bocchi.reply(from, ind.notRegistered(), id)
            fun.dare()
                .then(async (body) => {
                    const dare = body.split('\n')
                    const randomDare = dare[Math.floor(Math.random() * dare.length)]
                    await bocchi.reply(from, randomDare, id)
                })
                .catch(async (err) => {
                    console.error(err)
                    await bocchi.reply(from, `Error!\n${err}`, id)
                })
        }
	    
        // Anti-group link detector
        if (isGroupMsg && !isGroupAdmins && isBotGroupAdmins && isDetectorOn && !isOwner) {
            if (chats.match(new RegExp(/(https:\/\/chat.whatsapp.com)/gi))) {
                await bocchi.reply(from, ind.linkDetected(), id)
                await bocchi.removeParticipant(groupId, sender.id)
            }
        }

        // Auto-stiker
        if (isGroupMsg && isAutoStikerOn && isMedia && isImage && !isCmd) {
            const mediaData = await decryptMedia(message, uaOverride)
            const imageBase64 = `data:${mimetype};base64,${mediaData.toString('base64')}`
            await bocchi.sendImageAsSticker(from, imageBase64)
                .then(async () => {
                    console.log(`Sticker processed for ${processTime(t, moment())} seconds`)
                })
                .catch(async (err) => {
                    console.error(err)
                    await bocchi.reply(from, `Error!\n${err}`, id)
                })
        }

        // AFK
        if (isGroupMsg) {
            for (let ment of mentionedJidList) {
                if (checkAfkUser(ment)) {
                    const getId = getAfkId(ment)
                    const getReason = getAfkReason(getId)
                    const getTime = getAfkTime(getId)
                    await bocchi.reply(from, ind.afkMentioned(getReason, getTime), id)
                }
            }
            if (checkAfkUser(sender.id) && !isCmd) {
                _afk.splice(getAfkPosition(sender.id), 1)
                fs.writeFileSync('./database/afk.json', JSON.stringify(_afk))
                await bocchi.sendText(from, ind.afkDone(pushname))
            }
        }

        // Ignore non-cmd
        if (!isCmd) return

        // Ignore banned and blocked users
        if (isCmd && (isBanned || isBlocked) && !isGroupMsg) return console.log(color('[BAN]', 'red'), color(time, 'yellow'), color(`${command} [${args.length}]`), 'from', color(pushname))
        if (isCmd && (isBanned || isBlocked) && isGroupMsg) return console.log(color('[BAN]', 'red'), color(time, 'yellow'), color(`${command} [${args.length}]`), 'from', color(pushname), 'in', color(name || formattedTitle))

        // Anti-spam
        if (isCmd && msgFilter.isFiltered(from) && !isGroupMsg) return console.log(color('[SPAM]', 'red'), color(time, 'yellow'), color(`${command} [${args.length}]`), 'from', color(pushname))
        if (isCmd && msgFilter.isFiltered(from) && isGroupMsg) return console.log(color('[SPAM]', 'red'), color(time, 'yellow'), color(`${command} [${args.length}]`), 'from', color(pushname), 'in', color(name || formattedTitle))

        // Log
        if (isCmd && !isGroupMsg) console.log(color('[EXEC]'), color(time, 'yellow'), color(`${command} [${args.length}]`), 'from', color(pushname))
        if (isCmd && isGroupMsg) console.log(color('[EXEC]'), color(time, 'yellow'), color(`${command} [${args.length}]`), 'from', color(pushname), 'in', color(name || formattedTitle))

        // Anti-spam
        msgFilter.addFilter(from)

        switch (command) {
            // Register
            case 'register':
                if (isRegistered) return await bocchi.reply(from, ind.registeredAlready(), id)
                if (!q.includes('|')) return await bocchi.reply(from, ind.wrongFormat(), id)
                const namaUser = q.substring(0, q.indexOf('|') - 1)
                const umurUser = q.substring(q.lastIndexOf('|') + 2)
                const serialUser = createSerial(20)
                if (isGroupMsg) {
                    addRegisteredUser(sender.id, namaUser, umurUser, time, serialUser)
                    await bocchi.reply(from, ind.pc(pushname), id)
                    await bocchi.sendText(sender.id, ind.registered(namaUser, umurUser, sender.id, time, serialUser))
                    console.log(color('[REGISTER]'), color(time, 'yellow'), 'Name:', color(namaUser, 'cyan'), 'Age:', color(umurUser, 'cyan'), 'Serial:', color(serialUser, 'cyan'),'in', color(name || formattedTitle))
                } else {
                    addRegisteredUser(sender.id, namaUser, umurUser, time, serialUser)
                    await bocchi.reply(from, ind.registered(namaUser, umurUser, sender.id, time, serialUser), id)
                    console.log(color('[REGISTER]'), color(time, 'yellow'), 'Name:', color(namaUser, 'cyan'), 'Age:', color(umurUser, 'cyan'), 'Serial:', color(serialUser, 'cyan'))
                }
            break
			
			// TEXTOS

            case 'blackpink':
             if (args.length == 0) return bocchi.reply(from, `Membuat Gambar Text BlackPink\nPemakaian: ${prefix}blackpink [teks]\n\ncontoh: ${prefix}blackpink Dimas`, id)
                await bocchi.reply(from, `Aguarde....`, id)
                console.log('Criando texto...')
                const lblackpink = body.slice(11)
                await bocchi.sendFileFromUrl(from, `https://docs-jojo.herokuapp.com/api/blackpink?text=${lblackpink}`, '', 'Aí está...', id)
                    .then(() => console.log('Sucesso ao criar imagem!!'))
                    .catch(async (err) => {
                        console.error(err)
                        await bocchi.reply(from, `Error!`, id)
                    })
            break
            case '3d':
             if (args.length == 0) return bocchi.reply(from, `Membuat Gambar Text 3D\nPemakaian: ${prefix}text3d [teks]\n\ncontoh: ${prefix}text3d Dimas`, id)
                await bocchi.reply(from, `Aguarde....`, id)
                console.log('Creating text3d text...')
                const ltext3d = body.slice(3)
                await bocchi.sendFileFromUrl(from, `https://docs-jojo.herokuapp.com/api/text3d?text=${ltext3d}`, '', 'Aí está...', id)
                    .then(() => console.log('Sucesso ao criar imagem!'))
                    .catch(async (err) => {
                        console.error(err)
                        await bocchi.reply(from, `Error!`, id)
                    })
            break		
            case 'thundertext':
              if (!isGroupMsg) return bocchi.reply(from, menuId.textPrem())
              if (args.length == 0) return bocchi.reply(from, `Membuat Text Gambar thunder\nPemakaian: ${prefix}thundertext [teks]\n\ncontoh: ${prefix}thundertext Dimas`, id)
                    await bocchi.reply(from, `Wait....`, id)
                console.log('Creating Thunder text...')
                const lthundertext = body.slice(13)
                await bocchi.sendFileFromUrl(from, `https://api.vhtear.com/thundertext?text=${lthundertext}&apikey=${config.vhtear}`, '', 'Nih...', id)
                    .then(() => console.log('Success creting image!'))
                    .catch(async (err) => {
                        console.error(err)
                        await bocchi.reply(from, `Erro!!`, id)
                    })
            break		
            case 'slidingtext':
             if (!isGroupMsg) return bocchi.reply(from, menuId.textPrem())
             if (args.length == 0) return bocchi.reply(from, `Membuat Text Sliding\nPemakaian: ${prefix}slidingtext [teks]\n\ncontoh: ${prefix}slidingtext Dimas`, id)
                    await bocchi.reply(from, `Wait....`, id)
                console.log('Creating slidingtext text...')
                const lslidingtext = body.slice(13)
                await bocchi.sendFileFromUrl(from, `https://api.vhtear.com/slidingtext?text=${lslidingtext}&apikey=${config.vhtear}`, '', 'neh....', id)
                    .then(() => console.log('Success creting image!'))
                    .catch(async (err) => {
                        console.error(err)
                        await bocchi.reply(from, `Error!`, id)
                    })
            break
            case 'lovemessagetext':
             if (!isGroupMsg) return bocchi.reply(from, menuId.textPrem())
             if (args.length == 0) return bocchi.reply(from, `Membuat Text jadi Gambar lovemessage\nPemakaian: ${prefix}lovemessagetext [teks]\n\ncontoh: ${prefix}lovemessagetext Dimas D`, id)
                    await bocchi.reply(from, `Wait....`, id)
                console.log('Creating lovemessagetext text...')
                const llovemessagetext = body.slice(17)
                await bocchi.sendFileFromUrl(from, `https://api.vhtear.com/lovemessagetext?text=${llovemessagetext}&apikey=${config.vhtear}`, '', 'Nih...', id)
                    .then(() => console.log('Success creting image!'))
                    .catch(async (err) => {
                        console.error(err)
                        await bocchi.reply(from, `Error!`, id)
                    })
            break
            case 'glowtext':
             if (!isGroupMsg) return bocchi.reply(from, menuId.textPrem())
              if (args.length == 0) return bocchi.reply(from, `Membuat Text jadi Gambar ala ala glow gitu\nPemakaian: ${prefix}glowtext [teks]\n\ncontoh: ${prefix}glowtext Dimas D`, id)
                    await bocchi.reply(from, `Wait....`, id)
                console.log('Creating glowtext text...')
                const lglowtext = body.slice(10)
                await bocchi.sendFileFromUrl(from, `https://api.vhtear.com/glowtext?text=${lglowtext}&apikey=${config.vhtear}`, '', 'Nih...', id)
                    .then(() => console.log('Success creting image!'))
                    .catch(async (err) => {
                        console.error(err)
                        await bocchi.reply(from, `Error!`, id)
                    })
            break
            case 'romancetext':
             if (!isGroupMsg) return bocchi.reply(from, menuId.textPrem())
             if (args.length == 0) return bocchi.reply(from, `Membuat Text jadi Gambar ala ala romance\nPemakaian: ${prefix}romancetext [teks]\n\ncontoh: ${prefix}romancetext Dimas dan Ujang`, id)
                    await bocchi.reply(from, `Wait....`, id)
                console.log('Creating romancetext text...')
                const lpartytext = body.slice(11)
                await bocchi.sendFileFromUrl(from, `https://api.vhtear.com/romancetext?text=${lpartytext}&apikey=${config.vhtear}`, '', 'Nih...', id)
                    .then(() => console.log('Success creting image!'))
                    .catch(async (err) => {
                        console.error(err)
                        await bocchi.reply(from, `Error!`, id)
                    })
            break
            case 'silktext':
             if (!isGroupMsg) return bocchi.reply(from, menuId.textPrem())
             if (args.length == 0) return bocchi.reply(from, `Membuat Text jadi Gambar Nature\nPemakaian: ${prefix}textmaker [teks]\n\ncontoh: ${prefix}textmaker Dimas`, id)
                    await bocchi.reply(from, `Wait....`, id)
                console.log('Creating textmaker text...')
                const lsilktext = body.slice(10)
                await bocchi.sendFileFromUrl(from, `https://api.vhtear.com/silktext?text=${lsilktext}&apikey=${config.vhtear}`, '', 'Nih...', id)
                    .then(() => console.log('Success creting image!'))
                    .catch(async (err) => {
                        console.error(err)
                        await bocchi.reply(from, `Error!`, id)
                    })
            break
            case 'partytext':
             if (!isGroupMsg) return bocchi.reply(from, menuId.textPrem())
             if (args.length == 0) return bocchi.reply(from, `Membuat Text jadi Gambar ala ala party\nPemakaian: ${prefix}partytext [teks]\n\ncontoh: ${prefix}partytext Dimas`, id)
                    await bocchi.reply(from, `Wait....`, id)
                console.log('Creating partytext text...')
                const llpartytext = body.slice(11)
                await bocchi.sendFileFromUrl(from, `https://api.vhtear.com/partytext?text=${llpartytext}&apikey=${config.vhtear}`, '', 'Nih...', id)
                    .then(() => console.log('Success creting image!'))
                    .catch(async (err) => {
                        console.error(err)
                        await bocchi.reply(from, `Error!`, id)
                    })
            break	
           
            //QR CODES

			
                
            // Level [ALPHA]
            case 'level':
                if (!isRegistered) return await bocchi.reply(from, ind.notRegistered(), id)
                if (!isLevelingOn) return await bocchi.reply(from, ind.levelingNotOn(), id)
                if (!isGroupMsg) return await bocchi.reply(from, ind.groupOnly(), id)
                const userLevel = getLevelingLevel(sender.id)
                const userXp = getLevelingXp(sender.id)
                if (userLevel === undefined && userXp === undefined) return await bocchi.reply(from, ind.levelNull(), id)
                const ppLink = await bocchi.getProfilePicFromServer(sender.id)
                if (ppLink === undefined) {
                    var pepe = errorImg
                } else {
                    var pepe = ppLink
                }
                const requiredXp = 5000 * (Math.pow(2, userLevel) - 1)
                const userId = sender.id.substring(9, 13)
                const randomHexs = `#${(Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0')}`
                const randomHex = `#${(Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0')}`
                const rank = new canvas.Rank()
                    .setAvatar(pepe)
                    .setLevel(userLevel)
                    .setRankColor('#2c2f33', '#2c2f33')
                    .setCurrentXP(userXp)
                    .setRequiredXP(requiredXp)
                    .setProgressBar([randomHexs, randomHex], 'GRADIENT')
                    .setUsername(pushname)
                    .setDiscriminator('0001', '#FFFFFF00')
                rank.build()
                    .then(async (buffer) => {
                        canvas.write(buffer, `${pushname}.png`)
                        await bocchi.sendFile(from, `${pushname}.png`, `${pushname}.png`, '', id)
                        fs.unlinkSync(`${pushname}.png`)
                    })
                    .catch(async (err) => {
                        console.error(err)
                        await bocchi.reply(from, `Error!\n${err}`, id)
                    })
            break
            case 'leaderboard':
                if (!isRegistered) return await bocchi.reply(from, ind.notRegistered(), id)
                if (!isLevelingOn) return await bocchi.reply(from, ind.levelingNotOn(), id)
                if (!isGroupMsg) return await bocchi.reply(from. ind.groupOnly(), id)
                _level.sort((a, b) => (a.xp < b.xp) ? 1 : -1)
                let leaderboard = '-----[ *LEADERBOARD* ]----\n\n'
                let nom = 0
                try {
                    for (let i = 0; i < 10; i++) {
                        nom++
                        leaderboard += `${nom}. @${_level[i].id.replace('@c.us', '')}\n➸ XP: *${_level[i].xp}* Level: *${_level[i].level}*\n\n`
                    }
                    await bocchi.sendTextWithMentions(from, leaderboard)
                } catch (err) {
                    console.error(err)
                    await bocchi.reply(from, ind.minimalDb(), id)
                }
            break

            // Downloader
            case 'joox':
                if (!isRegistered) return await bocchi.reply(from, ind.notRegistered(), id)
                if (!q) return await bocchi.reply(from, ind.wrongFormat(), id)
                await bocchi.reply(from, ind.wait(), id)
                downloader.joox(q)
                    .then(async ({ result }) => {
                        await bocchi.sendFileFromUrl(from, result[0].linkImg, `${result[0].judul}.jpg`, ind.joox(result), id)
                        await bocchi.sendFileFromUrl(from, result[0].linkMp3, `${result[0].judul}.mp3`, '', id)
                        console.log('Success sending music from Joox!')
                    })
                    .catch(async (err) => {
                        console.error(err)
                        await bocchi.reply(from, `Error!\n${err}`, id)
                    })
            break
            case 'facebook':
            case 'fb':
                if (!isRegistered) return await bocchi.reply(from, ind.notRegistered(), id)
                if (!isUrl(url) && !url.includes('facebook.com')) return await bocchi.reply(from, ind.wrongFormat(), id)
                await bocchi.reply(from, ind.wait(), id)
                downloader.facebook(url)
                    .then(async ({ status, title, link, pesan }) => {
                        if (status === 'error') {
                            return await bocchi.reply(from, pesan, id)
                        } else {
                            await bocchi.sendFileFromUrl(from, link, `${title}.mp4`, title, id)
                            console.log(from, 'Success sending Facebook video!')
                        }
                    })
                    .catch(async (err) => {
                        console.error(err)
                        await bocchi.reply(from, `Error!\n${err}`, id)
                    })
            break
            case 'ytmp3':
                if (!isRegistered) return await bocchi.reply(from, ind.notRegistered(), id)
                if (!isUrl(url) && !url.includes('youtu.be')) return await bocchi.reply(from, ind.wrongFormat(), id)
                await bocchi.reply(from, ind.wait(), id)
                downloader.ytdl(url)
                    .then(async (res) => {
                        if (res.status === 'error') {
                            return await bocchi.reply(from, res.pesan, id)
                        } else {
                            await bocchi.sendFileFromUrl(from, res.thumbnail, `${res.title}.jpg`, ind.ytFound(res), id)
                            await bocchi.sendFileFromUrl(from, res.url_audio, `${res.title}.mp3`, '', id)
                            console.log('Success sending YouTube audio!')
                        }
                    })
                    .catch(async (err) => {
                        console.error(err)
                        await bocchi.reply(from, `Error!\n${err}`, id)
                    })
            break
            case 'ytmp4':
                if (!isRegistered) return await bocchi.reply(from, ind.notRegistered(), id)
                if (!isUrl(url) && !url.includes('youtu.be')) return await bocchi.reply(from, ind.wrongFormat(), id)
                await bocchi.reply(from, ind.wait(), id)
                downloader.ytdl(url)
                    .then(async (res) => {
                        if (res.status === 'error') {
                            return await bocchi.reply(from, res.pesan, id)
                        } else {
                            await bocchi.sendFileFromUrl(from, res.thumbnail, `${res.title}.jpg`, ind.ytFound(res), id)
                            await bocchi.sendFileFromUrl(from, res.url_video, `${res.title}.mp4`, '', id)
                            console.log('Success sending YouTube video!')
                        }
                    })
                    .catch(async (err) => {
                        console.error(err)
                        await bocchi.reply(from, `Error!\n${err}`, id)
                    })
            break
	    case 'tiktokpic':
                if (!isRegistered) return await bocchi.reply(from, ind.notRegistered(), id)
                if (!q) return await bocchi.reply(from, ind.wrongFormat(), id)
                await bocchi.reply(from, ind.wait(), id)
                try {
                    console.log(`Getting profile pic for ${q}`)
                    const tkt = await axios.get(`https://docs-jojo.herokuapp.com/api/tiktokpp?user=${q}`)
                    if (tkt.data.error) return bocchi.reply(from, tkt.data.error, id)
                    await bocchi.sendFileFromUrl(from, tkt.data.result, 'tiktokpic.jpg', 'Ini :D', id)
                    console.log('Success sending TikTok profile pic!')
                } catch (err) {
                    console.error(err)
                    await bocchi.reply(from, `Error!\n${err}`, id)
                }
            break
            case 'tiktok': 
                if (!isRegistered) return await bocchi.reply(from, ind.notRegistered(), id)
                if (!isUrl(url) && !url.includes('tiktok.com')) return await bocchi.reply(from, ind.wrongFormat(), id)
                await bocchi.reply(from, ind.wait(), id)
                downloader.tik(url)
                    .then(async ({ result })=> {
                        await bocchi.sendFileFromUrl(from, result.video, 'tiktok.mp4', '', id)
                    })
                    .catch(async (err) => {
                        console.log(err)
                        await bocchi.reply(from, `Error!\n${err}`, id)
                    })
            break

            // Misc
            case 'say':
                if (!isRegistered) return await bocchi.reply(from, ind.notRegistered(), id)
                if (!q) return await bocchi.reply(from, ind.wrongFormat(), id)
                await bocchi.sendText(from, q)
            break
            case 'afk':
                if (!isRegistered) return await bocchi.reply(from, ind.notRegistered(), id)
                if (!isGroupMsg) return await bocchi.reply(from, ind.groupOnly(), id)
                if (isAfkOn) return await bocchi.reply(from, ind.afkOnAlready(), id)
                const reason = q ? q : 'Nothing.'
                addAfkUser(sender.id, time, reason)
                await bocchi.reply(from, ind.afkOn(pushname, reason), id)
            break
            case 'lyric':
            case 'lirik':
                if (!isRegistered) return await bocchi.reply(from, ind.notRegistered(), id)
                if (!q) return await bocchi.reply(from, ind.wrongFormat(), id)
                await bocchi.reply(from, ind.wait(), id)
                misc.lirik(q)
                    .then(async ({ result }) => {
                        if (result.code !== 200) return await bocchi.reply(from, 'Not found.', id)
                        await bocchi.reply(from, result.result, id)
                        console.log('Success sending lyric!')
                    })
                    .catch(async (err) => {
                        console.error(err)
                        await bocchi.reply(from, `Error!\n${err}`, id)
                    })
            break
            case 'shortlink':
                if (!isRegistered) return await bocchi.reply(from, ind.notRegistered(), id)
                if (!isUrl(url)) return await bocchi.reply(from, ind.wrongFormat(), id)
                const urlShort = await misc.shortener(url)
                await bocchi.reply(from, ind.wait(), id)
                await bocchi.reply(from, urlShort, id)
            break
            case 'wikipedia':
            case 'wiki':
                if (!isRegistered) return await bocchi.reply(from, ind.notRegistered(), id)
                if (!q) return await bocchi.reply(from, ind.wrongFormat(), id)
                await bocchi.reply(from, ind.wait(), id)
                misc.wiki(q)
                    .then(async ({ result, status }) => {
                        if (status !== 200) {
                            return await bocchi.reply(from, 'Not found.', id)
                        } else {
                            await bocchi.reply(from, result, id)
                                .then(() => console.log('Success sending Wiki!'))
                        }
                    })
                    .catch(async (err) => {
                        console.error(err)
                        await bocchi.reply(from, `Error!\n${err}`, id)
                    })
            break
            case 'kbbi':
                if (!isRegistered) return await bocchi.reply(from, ind.notRegistered(), id)
                if (!q) return await bocchi.reply(from, ind.wrongFormat(), id)
                await bocchi.reply(from, ind.wait(), id)
                misc.kbbi(q)
                    .then(async ({ status, result, pesan }) => {
                        if (status === 'error') {
                            await bocchi.reply(from, pesan, id)
                        } else {
                            await bocchi.reply(from, result, id)
                                .then(() =>  console.log('Success sending definition!'))
                        }
                    })
                    .catch(async (err) => {
                        console.error(err)
                        await bocchi.reply(from, `Error!\n${err}`, id)
                    })
            break
	        case 'jadwalsholat':
            case 'jadwalsolat':
                if (!isRegistered) return await bocchi.reply(from, ind.notRegistered(), id)
                if (!q) return await bocchi.reply(from, ind.wrongFormat(), id)
                await bocchi.reply(from, ind.wait(), id)
                misc.jadwalSholat(q)
                    .then((data) => {
                        data.map(async ({isya, subuh, dzuhur, ashar, maghrib, terbit}) => {
                            const x  = subuh.split(':')
                            const y = terbit.split(':')
                            const xy = x[0] - y[0]
                            const yx = x[1] - y[1]
                            const perbandingan = `${xy < 0 ? Math.abs(xy) : xy} jam ${yx < 0 ? Math.abs(yx) : yx} menit`
                            const msg = `Jadwal sholat untuk ${q} dan sekitarnya ( *${tanggal}* )\n\nDzuhur: ${dzuhur}\nAshar: ${ashar}\nMaghrib: ${maghrib}\nIsya: ${isya}\nSubuh: ${subuh}\n\nDiperkirakan matahari akan terbit pada pukul ${terbit} dengan jeda dari subuh sekitar ${perbandingan}`
                            await bocchi.reply(from, msg, id)
                            console.log('Success sending jadwal sholat!')
                        })
                    })
                    .catch(async (err) => {
                        console.error(err)
                        await bocchi.reply(from, `Error!\n${err}`, id)
                    })
            break
            case 'gempa':
                if (!isRegistered) return await bocchi.reply(from, ind.notRegistered(), id)
                await bocchi.reply(from, ind.wait(), id)
                misc.bmkg()
                    .then(async ({ kedalaman, koordinat, lokasi, magnitude, map, potensi, waktu }) => {
                        let teksInfo = `${lokasi}\n\nKoordinat: ${koordinat}\nKedalaman: ${kedalaman}\nMagnitudo: ${magnitude} SR\nPotensi: ${potensi}\n\n${waktu}`
                        await bocchi.sendFileFromUrl(from, map, 'gempa.jpg', teksInfo, id)
                            .then(() => console.log('Success sending info!'))
                    })
                    .catch(async (err) => {
                        console.error(err)
                        await bocchi.reply(from, `Error!\n${err}`, id)
                    })
            break
            case 'igstalk':
                if (!isRegistered) return await bocchi.reply(from, ind.notRegistered(), id)
                if (!q) return await bocchi.reply(from, ind.wrongFormat(), id)
                await bocchi.reply(from, ind.wait(), id)
                misc.igStalk(q)
                    .then(async ({ Biodata, Jumlah_Followers, Jumlah_Following, Jumlah_Post, Profile_pic, Username, status, error }) => {
                        if (status !== 200) {
                            return await bocchi.reply(from, error, id)
                        } else {
                            let igCaption = `${Biodata.split('\nby: ArugaZ').join('')}\n\nUsername: ${Username}\nFollowers: ${Jumlah_Followers}\nFollowing: ${Jumlah_Following}\nPost: ${Jumlah_Post}`
                            await bocchi.sendFileFromUrl(from, Profile_pic, `${Username}.jpg`, igCaption, null, null, true)
                                .then(() => console.log('Success sending Instagram info!'))
                        }
                    })
                    .catch(async (err) => {
                        console.error(err)
                        await bocchi.reply(from, `Error!\n${err}`, id)
                    })
            break
            case 'gsmarena':
                if (!isRegistered) return await bocchi.reply(from, ind.notRegistered(), id)
                if (!q) return await bocchi.reply(from, ind.wrongFormat(), id)
                await bocchi.reply(from, ind.wait(), id)
                try {
                    misc.gsmarena(q)
                        .then(async ({ result }) => {
                            await bocchi.sendFileFromUrl(from, result.image, `${result.title}.jpg`, ind.gsm(result), id)
                                .then(() => console.log('Success sending phone info!'))
                        })
                } catch (err) {
                    console.error(err)
                    await bocchi.reply(from, `Error!\n${err}`, id)
                }
            break
            case 'receipt':
            case 'resep':
                if (!isRegistered) return await bocchi.reply(from, ind.notRegistered(), id)
                if (!q) return await bocchi.reply(from, ind.wrongFormat(), id)
                await bocchi.reply(from, ind.wait(), id)
                try {
                    misc.resep(q)
                        .then(async ({ result }) => {
                            await bocchi.sendFileFromUrl(from, result.image, `${result.title}.jpg`, ind.receipt(result), id)
                                .then(() => console.log('Success sending food receipt!'))
                        })
                } catch (err) {
                    console.error(err)
                    await bocchi.reply(from, `Error!\n${err}`, id)
                }
            break
	        case 'findsticker':
            case 'findstiker':
                if (!isRegistered) return await bocchi.reply(from, ind.notRegistered(), id)
                if (!q) return await bocchi.reply(from, ind.wrongFormat(), id)
                await bocchi.reply(from, ind.wait(), id)
                try {
                    misc.sticker(q)
                        .then(async ({ result }) => {
                            if (result.response !== 200) return await bocchi.reply(from, 'Not found!', id)
                            for (let i = 0; i < result.data.length; i++) {
                                await bocchi.sendStickerfromUrl(from, result.data[i])
                            }
                            console.log('Success sending sticker!')
                        })
                } catch (err) {
                    console.error(err)
                    await bocchi.reply(from, `Error!\n\n${err}`, id)
                }
            break
	        case 'distance':
                if (!isRegistered) return await bocchi.reply(from, ind.notRegistered(), id)
                if (!q) return await bocchi.reply(from, ind.wrongFormat(), id)
                const kotaAsal = q.substring(0, q.indexOf('|') - 1)
                const kotaTujuan = q.substring(q.lastIndexOf('|') + 2)
	            misc.distance(kotaAsal, kotaTujuan)
                    .then(async ({ result }) => {
                        if (result.response !== 200) {
                            await bocchi.reply(from, 'Something is error, is the data you gave correct?', id)
                        } else {
                            await bocchi.reply(from, result.data, id)
                            console.log('Success sending distance info!')
                        }
                    })
            break
            case 'ytsearch':
            case 'yts':
                if (!isRegistered) return await bocchi.reply(from, ind.notRegistered(), id)
                if (!q) return await bocchi.reply(from, ind.wrongFormat(), id)
                await bocchi.reply(from, ind.wait(), id)
                try {
                    misc.ytSearch(q)
                        .then(async ({ result }) => {
                            for (let i = 0; i < 5; i++) {
                                const { urlyt, image, title, channel, duration, views } = await result[i]
                                await bocchi.sendFileFromUrl(from, image, `${title}.jpg`, ind.ytResult(urlyt, title, channel, duration, views), id)
                                console.log('Success sending YouTube results!')
                            }
                        })
                } catch (err) {
                    console.error(err)
                    await bocchi.reply(from, `Error!\n${err}`, id)
                }
            break
            case 'tts':
                if (!isRegistered) return await bocchi.reply(from, ind.notRegistered(), id)
                if (!q) return await bocchi.reply(from, ind.wrongFormat(), id)
                const speech = q.substring(q.indexOf('|') + 2)
                const ptt = tts(ar[0])
                try {
                    ptt.save(`${speech}.mp3`, speech, async () => {
                        await bocchi.sendPtt(from, `${speech}.mp3`, id)
                        fs.unlinkSync(`${speech}.mp3`)
                    })
                } catch (err) {
                    console.error(err)
                    await bocchi.reply(from, `Error!\n${err}`, id)
                }
            break
            case 'playstore':
            case 'ps':
                if (!isRegistered) return await bocchi.reply(from, ind.notRegistered(), id)
                if (!q) return await bocchi.reply(from, ind.wrongFormat(), id)
                await bocchi.reply(from, ind.wait(), id)
                try {
                    misc.playstore(q)
                        .then(async ({ result }) => {
                            for (let i = 0; i < 5; i++) {
                                const { app_id, icon, title, developer, description, price, free } = result[i]
                                await bocchi.sendFileFromUrl(from, icon, `${title}.jpg`, ind.playstore(app_id, title, developer, description, price, free))
                            }
                            console.log('Success sending PlayStore result!')
                        })
                } catch (err) {
                    console.error(err)
                    await bocchi.reply(from, `Error!\n\n${err}`, id)
                }
            break
            case 'math':
                if (!isRegistered) return await bocchi.reply(from, ind.notRegistered(), id)
                if (!q) return await bocchi.reply(from, ind.wrongFormat(), id)
                if (typeof mathjs.evaluate(q) !== "number") {
                    await bocchi.reply(from, ind.notNum(q), id)
                } else {
                    await bocchi.reply(from, `*「 MATH 」*\n\n${q} = ${mathjs.evaluate(q)}`, id)
                }
            break
            case 'shopee':
                if (!isRegistered) return await bocchi.reply(from, ind.notRegistered(), id)
                if (!q) return await bocchi.reply(from, ind.wrongFormat(), id)
                const namaBarang = q.substring(0, q.indexOf('|') - 1)
                const jumlahBarang = q.substring(q.lastIndexOf('|') + 2)
                await bocchi.reply(from, ind.wait(), id)
                try {
                    misc.shopee(namaBarang, jumlahBarang)
                        .then(async ({ result }) => {
                            for (let i = 0; i < result.items.length; i++) {
                                const { nama, harga, terjual, shop_location, description, link_product, image_cover } = result.items[i]
                                await bocchi.sendFileFromUrl(from, image_cover, `${nama}.jpg`, ind.shopee(nama, harga, terjual, shop_location, description, link_product))
                            }
                            console.log('Success sending Shopee data!')
                        })
                } catch (err) {
                    console.error(err)
                    await bocchi.reply(from, `Error!\n\n${err}`, id)
                }
            break
	        case 'mutualan':
                if (!isRegistered) return await bocchi.reply(from, ind.notRegistered(), id)
		        if (isGroupMsg) return await bocchi.reply(from, 'Command ini tidak bisa digunakan di dalam grup!', id)
                await bocchi.reply(from, 'Looking for a partner...', id)        
              	await bocchi.sendContact(from, getRegisteredRandomId())
            	await bocchi.sendText(from, `Partner found: 🙉\n*${prefix}next* — find a new partner`)
    	    break
            case 'next':
                if (!isRegistered) return await bocchi.reply(from, ind.notRegistered(), id)
	            if (isGroupMsg) return await bocchi.reply(from, 'Command ini tidak bisa digunakan di dalam grup!', id)
                await bocchi.reply(from, 'Looking for a partner...', id)        
              	await bocchi.sendContact(from, getRegisteredRandomId())
            	await bocchi.sendText(from, `Partner found: 🙉\n*${prefix}next* — find a new partner`)
            break	 
            case 'listsurah':
                if (!isRegistered) return await bocchi.reply(from, ind.notRegistered(), id)
                await bocchi.reply(from, ind.wait(), id)
                misc.listSurah()
                    .then(async ({ result }) => {
                        let list = '-----[ AL-QUR\'AN LIST ]-----\n\n'
                        for (let i = 0; i < result.list.length; i++) {
                            list += `${result.list[i]}\n\n`
                        }
                        await bocchi.reply(from, list, id)
                        console.log('Success sending Al-Qur\'an list!')
                    })
                    .catch(async (err) => {
                        console.error(err)
                        await bocchi.reply(from, `Error!\n${err}`, id)
                    })
            break
            case 'surah':
                if (!isRegistered) return await bocchi.reply(from, ind.notRegistered(), id)
                if (args.length !== 1) return await bocchi.reply(from, ind.wrongFormat(), id)
                await bocchi.reply(from, ind.wait(), id)
                misc.getSurah(args[0])
                    .then(async ({ result }) => {
                        await bocchi.reply(from, `${result.surah}\n\n${result.quran}`, id)
                        console.log('Success sending surah!')
                    })
                    .catch(async (err) => {
                        console.error(err)
                        await bocchi.reply(from, `Error!\n${err}`, id)
                    })
            break
            case 'motivasi':
                if (!isRegistered) return await bocchi.reply(from, ind.notRegistered(), id)
                misc.motivasi()
                    .then(async (body) => {
                        const motivasiSplit = body.split('\n')
                        const randomMotivasi = motivasiSplit[Math.floor(Math.random() * motivasiSplit.length)]
                        await bocchi.sendText(from, randomMotivasi)
                    })
                    .catch(async (err) => {
                        console.error(err)
                        await bocchi.reply(from, `Error!\n${err}`, id)
                    })
            break	
            case 'play':
                if (!isRegistered) return await bocchi.reply(from, ind.notRegistered(), id)
                if (!q) return await bocchi.reply(from, ind.wrongFormat(), id)
                await bocchi.reply(from, ind.wait(), id)
                misc.ytPlay(q)
                    .then(async ({ result }) => {
                        if (Number(result.size.split(' MB')[0]) >= 10.00) return await bocchi.reply(from, ind.videoLimit(), id)
                        await bocchi.sendFileFromUrl(from, result.image, `${result.title}.jpg`, ind.ytPlay(result), id)
                        await bocchi.sendFileFromUrl(from, result.mp3, `${result.title}.mp3`, '', id)
                    })
                    .catch(async (err) => {
                        console.error(err)
                        await bocchi.reply(from, `Error!\n${err}`, id)
                    })
            break
            case 'whois':
                if (!isRegistered) return await bocchi.reply(from, ind.notRegistered(), id)
                if (args.length !== 1) return await bocchi.reply(from, ind.wrongFormat(), id)
                await bocchi.reply(from, ind.wait(), id)
                misc.whois(args[0])
                    .then(async ({ result }) => {
                        await bocchi.reply(from, `*「 WHOIS 」*\n\n➸ *IP address*: ${result.ip_address}\n➸ *City*: ${result.city}\n➸ *Region*: ${result.region}\n➸ *Country*: ${result.country}\n➸ *ZIP code*: ${result.postal_code}\n➸ *Latitude and longitude*: ${result.latitude_longitude}\n➸ *Time zone*: ${result.time_zone}\n➸ *Call code*: ${result.calling_code}\n➸ *Currency*: ${result.currency}\n➸ *Language code*: ${result.languages}\n➸ *ASN*: ${result.asn}\n➸ *Organization*: ${result.org}`, id)
                    })
                    .catch(async (err) => {
                        console.error(err)
                        await bocchi.reply(from, `Error!\n${err}`, id)
                    })
            break
            case 'sms':
                if (!isRegistered) return await bocchi.reply(from, ind.notRegistered(), id)
                if (!q.includes('|')) return await bocchi.reply(from, ind.wrongFormat(), id)
                const pesanPengirim = q.substring(0, q.indexOf('|') - 1)
                const nomorPenerima = q.substring(q.lastIndexOf('|') + 2)
                await bocchi.reply(from, ind.wait(), id)
                misc.sms(nomorPenerima, pesanPengirim)
                    .then(async ({ status, pesan }) => {
                        if (status !== 'success') return await bocchi.reply(from, pesan, id)
                        await bocchi.reply(from, `Success sending SMS to: ${nomorPenerima}\nMessage: ${pesanPengirim}`, id)
                        console.log(`Success sending SMS to ${nomorPenerima}!`)
                    })
                    .catch(async (err) => {
                        console.error(err)
                        await bocchi.reply(from, `Error!\n${err}`, id)
                    })
            break
            
            // Bot
            case 'menu':
                if (!isRegistered) return await bocchi.reply(from, ind.notRegistered(), id)
                if (args[0] === '1') {
                    await bocchi.sendText(from, ind.menuDownloader())
                } else if (args[0] === '2') {
                    await bocchi.sendText(from, ind.menuBot())
                } else if (args[0] === '3') {
                    await bocchi.sendText(from, ind.menuMisc())
                } else if (args[0] === '4') {
                    await bocchi.sendText(from, ind.menuSticker())
                } else if (args[0] === '5') {
                    await bocchi.sendText(from, ind.menuWeeaboo())
                } else if (args[0] === '6') {
                    await bocchi.sendText(from, ind.menuFun())
                } else if (args[0] === '7') {
                    await bocchi.sendText(from, ind.menuModeration())
                } else if (args[0] === '8') {
                    if (isGroupMsg && !isNsfw) return await bocchi.reply(from, ind.notNsfw(), id)
                    await bocchi.sendText(from, ind.menuNsfw())
                } else if (args[0] === '9') {
                    if (!isOwner) return await bocchi.reply(from, ind.ownerOnly())
                    await bocchi.sendText(from, ind.menuOwner())
                } else if (args[0] === '10') {
                    if (!isGroupMsg) return await bocchi.reply(from, ind.groupOnly(), id)
                    await bocchi.sendText(from, ind.menuLeveling())
                } else {
                    await bocchi.sendText(from, ind.menu())
                }
            break
            case 'rules':
            case 'rule':
                if (!isRegistered) return await bocchi.reply(from, ind.notRegistered(), id)
                await bocchi.sendText(from, ind.rules())
            break
            case 'nsfw':
                if (!isRegistered) return await bocchi.reply(from, ind.notRegistered(), id)
                if (!isGroupMsg) return await bocchi.reply(from, ind.groupOnly(), id)
                if (!isGroupAdmins) return await bocchi.reply(from, ind.adminOnly(), id)
                if (ar[0] === 'enable') {
                    if (isNsfw) return await bocchi.reply(from, ind.nsfwAlready(), id)
                    _nsfw.push(chat.id)
                    fs.writeFileSync('./database/nsfw.json', JSON.stringify(_nsfw))
                    await bocchi.reply(from, ind.nsfwOn(), id)
                } else if (ar[0] === 'disable') {
                    _nsfw.splice(chat.id, 1)
                    fs.writeFileSync('./database/nsfw.json', JSON.stringify(_nsfw))
                    await bocchi.reply(from, ind.nsfwOff(), id)
                } else {
                    await bocchi.reply(from, ind.wrongFormat(), id)
                }
            break
            case 'status':
                if (!isRegistered) return await bocchi.reply(from, ind.notRegistered(), id)
                await bocchi.sendText(from, `*RAM usage*: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB / ${Math.round(os.totalmem / 1024 / 1024)} MB\nCPU: ${os.cpus()[0].model}`)
            break
            case 'listblock':
                if (!isRegistered) return await bocchi.reply(from, ind.notRegistered(), id)
                let block = ind.listBlock(blockNumber)
                for (let i of blockNumber) {
                    block += `@${i.replace(/@c.us/g, '')}\n`
                }
                await bocchi.sendTextWithMentions(from, block)
            break
            case 'ping':
            case 'p':
                if (!isRegistered) return await bocchi.reply(from, ind.notRegistered(), id)
                await bocchi.sendText(from, `Pong!\nSpeed: ${processTime(t, moment())} secs`)
            break
            case 'delete':
            case 'del':
                if (!isRegistered) return await bocchi.reply(from, ind.notRegistered(), id)
                if (!quotedMsg) return await bocchi.reply(from, ind.wrongFormat(), id)
                if (!quotedMsgObj.fromMe) return await bocchi.reply(from, ind.wrongFormat(), id)
                await bocchi.deleteMessage(quotedMsgObj.chatId, quotedMsgObj.id, false)
            break
            case 'report':
                if (!isRegistered) return await bocchi.reply(from, ind.notRegistered(), id)
                if (!q) return await bocchi.reply(from, ind.emptyMess(), id)
                const lastReport = getLimit(sender.id)
                if (lastReport !== undefined && cd - (Date.now() - lastReport) > 0) {
                    const time = ms(cd - (Date.now() - lastReport))
                    await bocchi.reply(from, ind.limit(time), id)
                } else {
                    if (isGroupMsg) {
                        await bocchi.sendText(ownerNumber, `-----[ REPORT ]-----\n\n*From*: ${pushname}\n*ID*: ${sender.id}\n*Group*: ${(name || formattedTitle)}\n*Message*: ${q}`)
                        await bocchi.reply(from, ind.received(pushname), id)
                    } else {
                        await bocchi.sendText(ownerNumber, `-----[ REPORT ]-----\n\n*From*: ${pushname}\n*ID*: ${sender.id}\n*Message*: ${q}`)
                        await bocchi.reply(from, ind.received(pushname), id)
                    }
                    addLimit(sender.id)
                }
            break
            case 'tos':
                if (!isRegistered) return await bocchi.reply(from, ind.notRegistered(), id)
                await bocchi.sendLinkWithAutoPreview(from, 'https://github.com/SlavyanDesu/BocchiBot', ind.tos(ownerNumber))
            break
            case 'join':
                if (!isRegistered) return await bocchi.reply(from, ind.notRegistered(), id)
                if (!isUrl(url) && !url.includes('chat.whatsapp.com')) return await bocchi.reply(from, ind.wrongFormat(), id)
                await bocchi.joinGroupViaLink(url)
                await bocchi.sendText(from, ind.ok())
            break

            // Weeb zone
            case 'neko':
                if (!isRegistered) return await bocchi.reply(from, ind.notRegistered(), id)
                await bocchi.reply(from, ind.wait(), id)
                console.log('Getting neko image...')
                await bocchi.sendFileFromUrl(from, (await neko.sfw.neko()).url, 'neko.jpg', '', null, null, true)
                    .then(() => console.log('Success sending neko image!'))
                    .catch(async (err) => {
                        console.error(err)
                        await bocchi.reply(from, `Error!\n${err}`, id)
                    })
            break 
            case 'wallpaper':
            case 'wp':
                if (!isRegistered) return await bocchi.reply(from, ind.notRegistered(), id)
                await bocchi.reply(from, ind.wait(), id)
                console.log('Getting wallpaper image...')
                await bocchi.sendFileFromUrl(from, (await neko.sfw.wallpaper()).url, 'wallpaper.jpg', '', null, null, true)
                    .then(() => console.log('Success sending wallpaper image!'))
                    .catch(async (err) => {
                        console.error(err)
                        await bocchi.reply(from, `Error!\n${err}`, id )
                    })
            break
            case 'kemono':
                if (!isRegistered) return await bocchi.reply(from, ind.notRegistered(), id)
                await bocchi.reply(from, ind.wait(), id)
                console.log('Getting kemonomimi image...')
                await bocchi.sendFileFromUrl(from, (await neko.sfw.kemonomimi()).url, 'kemono.jpg', '', null, null, true)
                    .then(() => console.log('Success sending kemonomimi image!'))
                    .catch(async (err) => {
                        console.error(err)
                        await bocchi.reply(from, `Error!\n${err}`, id)
                    })
            break
            case 'kusonime':
                if (!isRegistered) return await bocchi.reply(from, ind.notRegistered(), id)
                if (!q) return await bocchi.reply(from, ind.wrongFormat(), id)
                await bocchi.reply(from, ind.wait(), id)
                weeaboo.anime(q)
                    .then(async ({ info, link_dl, sinopsis, thumb, title, error, status }) => {
                        if (status === false) {
                            return await bocchi.reply(from, error, id)
                        } else {
                            let animek = `${title}\n\n${info}\n\nSinopsis: ${sinopsis}\n\nLink download:\n${link_dl}`
                            await bocchi.sendFileFromUrl(from, thumb, 'animek.jpg', animek, null, null, true)
                                .then(() => console.log('Success sending anime info!'))
                        }
                    })
                    .catch(async (err) => {
                        console.error(err)
                        await bocchi.reply(from, `Error!\n${err}`, id)
                    })
            break
            case 'komiku':
                if (!isRegistered) return await bocchi.reply(from, ind.notRegistered(), id)
                if (!q) return await bocchi.reply(from, ind.wrongFormat(), id)
                await bocchi.reply(from, ind.wait(), id)
                weeaboo.manga(q)
                    .then(async ({ genre, info, link_dl, sinopsis, thumb }) => {
                        let mangak = `${info}${genre}\nSinopsis: ${sinopsis}\nLink download:\n${link_dl}`
                        await bocchi.sendFileFromUrl(from, thumb, 'mangak.jpg', mangak, null, null, true)
                            .then(() => console.log('Success sending manga info!'))
                    })
                    .catch(async (err) => {
                        console.error(err)
                        await bocchi.reply(from, `Error!\n${err}`, id)
                    })
            break
            case 'wait':
                if (!isRegistered) return await bocchi.reply(from, ind.notRegistered(), id)
                if (isMedia && type === 'image' || isQuotedImage) {
                    await bocchi.reply(from, ind.wait(), id)
                    console.log('Searching for anime source...')
                    const encryptMedia = isQuotedImage ? quotedMsg : message
                    const _mimetype = isQuotedImage ? quotedMsg.mimetype : mimetype
                    const mediaData = await decryptMedia(encryptMedia, uaOverride)
                    const imageBase64 = `data:${_mimetype};base64,${mediaData.toString('base64')}`
                    weeaboo.wait(imageBase64)
                        .then(async (result) => {
                            if (result.docs && result.docs.length <= 0) {
                                return await bocchi.reply(from, 'Anime not found! :(', id)
                            } else {
                                const { title, title_romaji, title_english, episode, similarity, filename, at, tokenthumb, anilist_id } = result.docs[0]
                                let teks = ''
                                if (similarity < 0.92) {
                                    teks = 'Low similarity. 🤔\n\n'
                                } else {
                                    teks += `*Title*: ${title}\n*Romaji*: ${title_romaji}\n*English*: ${title_english}\n*Episode*: ${episode}\n*Similarity*: ${(similarity * 100).toFixed(1)}%`
                                    const video = `https://media.trace.moe/video/${anilist_id}/${encodeURIComponent(filename)}?t=${at}&token=${tokenthumb}`
                                    await bocchi.sendFileFromUrl(from, video, `${title_romaji}.mp4`, teks, id)
                                        .then(() => console.log('Success sending anime source!'))
                                }
                            }
                        })
                        .catch(async (err) => {
                            console.error(err)
                            await bocchi.reply(from, `Error!\n${err}`, id)
                        })
                } else {
                    await bocchi.reply(from, ind.wrongFormat(), id)
                }
            break
            case 'source':
            case 'sauce':
                if (!isRegistered) return await bocchi.reply(from, ind.notRegistered(), id)
                if (isMedia && type === 'image' || isQuotedImage) {
                    await bocchi.reply(from, ind.wait(), id)
                    const encryptMedia = isQuotedImage ? quotedMsg : message
                    const mediaData = await decryptMedia(encryptMedia, uaOverride)
                    try {
                        const imageLink = await uploadImages(mediaData, `sauce.${sender.id}`)
                        console.log('Searching for source...')
                        const results = await saus(imageLink)
                        for (let i = 0; i < results.length; i++) {
                            let teks = ''
                            if (results[i].similarity < 80.00) {
                                teks = 'Low similarity. 🤔\n\n'
                            } else {
                                teks += `*Link*: ${results[i].url}\n*Site*: ${results[i].site}\n*Author name*: ${results[i].authorName}\n*Author link*: ${results[i].authorUrl}\n*Similarity*: ${results[i].similarity}%`
                                await bocchi.sendLinkWithAutoPreview(from, results[i].url, teks)
                                    .then(() => console.log('Source found!'))
                            }
                        }
                    } catch (err) {
                        console.error(err)
                        await bocchi.reply(from, `Error!\n${err}`, id)
                    }
                } else {
                    await bocchi.reply(from, ind.wrongFormat(), id)
                }
            break
            case 'waifu':
                if (!isRegistered) return await bocchi.reply(from, ind.notRegistered(), id)
                await bocchi.reply(from, ind.wait(), id)
                weeaboo.waifu(false)
                    .then(async ({ url }) => {
                        await bocchi.sendFileFromUrl(from, url, 'waifu.png', '', id)
                            .then(() => console.log('Success sending waifu!'))
                    })
                    .catch(async (err) => {
                        console.error(err)
                        await bocchi.reply(from, `Error!\n${err}`, id)
                    })
            break

            // Fun
            case 'profile':
            case 'me':
                if (!isRegistered) return await bocchi.reply(from, ind.notRegistered(), id)
                if (quotedMsg) {
                    const getQuoted = quotedMsgObj.sender.id
                    const profilePic = await bocchi.getProfilePicFromServer(getQuoted)
                    const username = quotedMsgObj.sender.name
                    const statuses = await bocchi.getStatus(getQuoted)
                    const benet = _ban.includes(getQuoted) ? 'Yes' : 'No'
                    const adm = groupAdmins.includes(getQuoted) ? 'Yes' : 'No'
                    const premi = _premium.includes(getQuoted) ? 'Yes' : 'No'
                    const { status } = statuses
                    if (profilePic === undefined) {
                        var pfp = errorImg
                    } else {
                        var pfp = profilePic
                    }
                    await bocchi.sendFileFromUrl(from, pfp, `${username}.jpg`, ind.profile(username, status, premi, benet, adm), id)
                } else {
                    const profilePic = await bocchi.getProfilePicFromServer(sender.id)
                    const username = pushname
                    const statuses = await bocchi.getStatus(sender.id)
                    const benet = isBanned ? 'Yes' : 'No'
                    const adm = isGroupAdmins ? 'Yes' : 'No'
                    const premi = isPremium ? 'Yes' : 'No'
                    const { status } = statuses
                    if (profilePic === undefined) {
                        var pfp = errorImg
                    } else {
                        var pfp = profilePic
                    }
                    await bocchi.sendFileFromUrl(from, pfp, `${username}.jpg`, ind.profile(username, status, premi, benet, adm), id)
                }
            break
            case 'hartatahta':
                if (!isRegistered) return await bocchi.reply(from, ind.notRegistered(), id)
                if (!q) return await bocchi.reply(from, ind.wrongFormat(), id)
                await bocchi.reply(from, ind.wait(), id)
                console.log('Creating harta tahta text...')
                await bocchi.sendFileFromUrl(from, `https://api.vhtear.com/hartatahta?text=${q}&apikey=${config.vhtear}`, `${q}.jpg`, '', id)
                    .then(() => console.log('Success creating image!'))
                    .catch(async (err) => {
                        console.error(err)
                        await bocchi.reply(from, `Error!\n${err}`, id)
                    })
            break
            case 'calender':
                if (!isRegistered) return await bocchi.reply(from, ind.notRegistered(), id)
                if (isMedia && type === 'image' || isQuotedImage) {
                    await bocchi.reply(from, ind.wait(), id)
                    const encryptMedia = isQuotedImage ? quotedMsg : message
                    const mediaData = await decryptMedia(encryptMedia, uaOverride)
                    const imageLink = await uploadImages(mediaData, `calender.${sender.id}`)
                    fun.calender(imageLink)
                        .then(async ({ result }) => {
                            await bocchi.sendFileFromUrl(from, result.imgUrl, 'calender.jpg', '', id)
                                .then(() => console.log('Success creating image!'))
                        })
                        .catch(async (err) => {
                            console.error(err)
                            await bocchi.reply(from, `Error!\n${err}`, id)
                        })
                } else {
                    await bocchi.reply(from, ind.wrongFormat(), id)
                }
            break
            case 'partner':
            case 'pasangan':
                if (!isRegistered) return await bocchi.reply(from, ind.notRegistered(), id)
                if (!q) return await bocchi.reply(from, ind.wrongFormat(), id)
                const nama = q.substring(0, q.indexOf('|') - 1)
                const pasangan = q.substring(q.lastIndexOf('|') + 2)
                await bocchi.reply(from, ind.wait(), id)
                fun.pasangan(nama, pasangan)
                    .then(async ({ result }) => {
                        await bocchi.reply(from, result.hasil, id)
                            .then(() => console.log('Success sending fortune!'))
                    })
                    .catch(async (err) => {
                        console.error(err)
                        await bocchi.reply(from, `Error!\n${err}`, id)
                    })
            break
            case 'zodiac':
            case 'zodiak':
                if (!isRegistered) return await bocchi.reply(from, ind.notRegistered(), id)
                const zodiak = args[0]
                if (!zodiak) return await bocchi.reply(from, ind.wrongFormat(), id)
                if (zodiak.length === 1) return await bocchi.reply(from, ind.wrongFormat(), id)
                await bocchi.reply(from, ind.wait(), id)
                fun.zodiak(zodiak)
                    .then(async ({ result }) => {
                        if (result.status === 204) {
                            return await bocchi.reply(from, result.ramalan, id)
                        } else {
                            let ramalan = `Zodiak: ${result.zodiak}\n\nRamalan: ${result.ramalan}\n\nAngka laksek: ${result.nomorKeberuntungan}\n\n${result.motivasi}\n\n${result.inspirasi}`
                            await bocchi.reply(from, ramalan, id)
                                .then(() => console.log('Success sending zodiac fortune!'))
                        }
                    })
                    .catch(async (err) => {
                        console.error(err)
                        await bocchi.reply(from, `Error!\n${err}`, id)
                    })
            break
            case 'write':
            case 'nulis':
                if (!isRegistered) return await bocchi.reply(from, ind.notRegistered(), id)
                if (!q) return await bocchi.reply(from, ind.wrongFormat(), id)
                await bocchi.reply(from, ind.wait(), id)
                console.log('Creating writing...')
                await bocchi.sendFileFromUrl(from, `https://api.vhtear.com/write?text=${q}&apikey=${config.vhtear}`, 'nulis.jpg', '', id)
                    .then(() => console.log('Success sending write image!'))
                    .catch(async (err) => {
                        console.error(err)
                        await bocchi.reply(from, `Error!\n${err}`, id)
                    })
            break
            case 'missing':
                if (!isRegistered) return await bocchi.reply(from, ind.notRegistered(), id)
                if (!q) return await bocchi.reply(from, ind.wrongFormat(), id)
                const atas = q.substring(0, q.indexOf('|') - 1)
                const tengah = q.substring(q.indexOf('|') + 2, q.lastIndexOf('|') - 1)
                const bawah = q.substring(q.lastIndexOf('|') + 2)
                if (isMedia && type === 'image' || isQuotedImage) {
                    await bocchi.reply(from, ind.wait(), id)
                    const encryptMedia = isQuotedImage ? quotedMsg : message
                    const mediaData = await decryptMedia(encryptMedia, uaOverride)
                    const imageLink = await uploadImages(mediaData, `missing.${sender.id}`)
                    fun.missing(atas, tengah, bawah, imageLink)
                        .then(async ({ result }) => {
                            await bocchi.sendFileFromUrl(from, result.imgUrl, 'missing.jpg', '', id)
                            console.log('Success sending image!')
                        })
                        .catch(async (err) => {
                            console.error(err)
                            await bocchi.reply(from, `Error!\n${err}`, id)
                        })
                } else {
                    await bocchi.reply(from, ind.wrongFormat(), id)
                }
            break
	    case 'text3d':
    	    case '3dtext':
                if (!isRegistered) return await bocchi.reply(from, ind.notRegistered(), id)
                if (!q) return await bocchi.reply(from, ind.wrongFormat(), id)
                await bocchi.reply(from, ind.wait(), id)
                console.log('Creating 3D text...')
                await bocchi.sendFileFromUrl(from, `https://docs-jojo.herokuapp.com/api/text3d?text=${q}`,`${q}.jpg`, '', id)
                console.log('Success creating 3D text!')
            break
            case 'valentine':
                if (!isRegistered) return await bocchi.reply(from, ind.notRegistered(), id)
                if (!q) return await bocchi.reply(from, ind.wrongFormat(), id)
                if (isMedia && type === 'image' || isQuotedImage) {
                    await bocchi.reply(from, ind.wait(), id)
                    const nama = q.substring(0, q.indexOf('|') - 1)
                    const pasangan = q.substring(q.lastIndexOf('|') + 2)
                    const encryptMedia = isQuotedImage ? quotedMsg : message
                    const dataPasangan = await decryptMedia(encryptMedia, uaOverride)
                    const foto = await bocchi.getProfilePicFromServer(sender.id)
                    const dataMu = await bent('buffer')(foto)
                    const fotoMu = await uploadImages(dataMu, `fotoMu.${sender.id}`)
                    const fotoPasangan = await uploadImages(dataPasangan, `fotoPasangan.${sender.id}`)
                    fun.valentine(nama, pasangan, fotoMu, fotoPasangan)
                        .then(async ({ result }) => {
                            await bocchi.sendFileFromUrl(from, result.imgUrl, `${nama}_${pasangan}.jpg`, '', id)
                                .then(() => console.log('Success creating image!'))
                        })
                        .catch(async (err) => {
                            console.error(err)
                            await bocchi.reply(from, `Error!\n${err}`, id)
                        })
                } else {
                    await bocchi.reply(from, ind.wrongFormat(), id)
                }
            break
            case 'simi':
                if (!isRegistered) return await bocchi.reply(from, ind.notRegistered(), id)
                if (!isGroupMsg) return await bocchi.reply(from, ind.groupOnly(), id)
                if (!q) return await bocchi.reply(from, ind.wrongFormat(), id)
                fun.simi(q)
                  .then(async ({ success }) => {
                      await bocchi.reply(from, success, id)
                  })
                  .catch(async (err) => {
                      console.error(err)
                      await bocchi.reply(from, `Error!\n\n${err}`, id)
                  })
            break
            case 'glitchtext':
            case 'glitext':
                if (!isRegistered) return await bocchi.reply(from, ind.notRegistered(), id)
                if (!q) return await bocchi.reply(from, ind.wrongFormat(), id)
                const teks1 = q.substring(0, q.indexOf('|') - 1)
                const teks2 = q.substring(q.lastIndexOf('|') + 2)
                await bocchi.reply(from, ind.wait(), id)
                console.log('Creating glitch text...')
		        await bocchi.sendFileFromUrl(from, `https://api.vhtear.com/glitchtext?text1=${teks1}&text2=${teks2}&apikey=${config.vhtear}`, 'glitch.jpg', '', id)
                    .then(() => console.log('Success creating image!'))
                    .catch(async (err) => {
                        console.error(err)
                        await bocchi.reply(from, `Error!\n${err}`, id)
                    })
            break
            case 'phmaker':
                if (!isRegistered) return await bocchi.reply(from, ind.notRegistered(), id)
                if (!q) return await bocchi.reply(from, ind.wrongFormat(), id)
                const kiri = q.substring(0, q.indexOf('|') - 1)
                const kanan = q.substring(q.lastIndexOf('|') + 2)
                await bocchi.reply(from, ind.wait(), id)
                console.log('Creating Pornhub text...')
                await bocchi.sendFileFromUrl(from, `https://api.vhtear.com/pornlogo?text1=${kiri}&text2=${kanan}&apikey=${config.vhtear}`, 'ph.jpg', '', id)
                    .then(() => console.log('Success creating image!'))
                    .catch(async (err) => {
                        console.error(err)
                        await bocchi.reply(from, `Error!\n${err}`, id)
                    })
            break
            case 'blackpink':
                if (!isRegistered) return await bocchi.reply(from, ind.notRegistered(), id)
                if (!q) return await bocchi.reply(from, ind.wrongFormat(), id)
                await bocchi.reply(from, ind.wait(), id)
                console.log('Creating Blackpink text...')
                await bocchi.sendFileFromUrl(from, `https://api.vhtear.com/blackpinkicon?text=${q}&apikey=${config.vhtear}`, `${q}.jpg`, '', id)
                    .then(() => console.log('Success creting image!'))
                    .catch(async (err) => {
                        console.error(err)
                        await bocchi.reply(from, `Error!\n${err}`, id)
                    })
            break
            case 'galaxy':
                if (!isRegistered) return await bocchi.reply(from, ind.notRegistered(), id)
                if (!q) return await bocchi.reply(from, ind.wrongFormat(), id)
                await bocchi.reply(from, ind.wait(), id)
                console.log('Creating galaxy text...')
                await bocchi.sendFileFromUrl(from, `https://api.vhtear.com/galaxytext?text=${q}&apikey=${config.vhtear}`, `${q}.jpg`, '', id)
                    .then(() => console.log('Success creating image!'))
                    .catch(async (err) => {
                        console.error(err)
                        await bocchi.reply(from, `Error!\n${err}`, id)
                    })
            break
            case 'tod':
	            if (!isRegistered) return await bocchi.reply(from, ind.notRegistered(), id)
                await bocchi.reply(from, 'Sebelum bermain berjanjilah akan melaksanakan apapun perintah yang diberikan.' , id)
                await bocchi.sendText(from, 'Silakan ketik *truth* atau *dare*.')
            break
            case 'weton':
                if (!isRegistered) return await bocchi.reply(from, ind.notRegistered(), id)
                if (!q.includes('|')) return await bocchi.reply(from, ind.wrongFormat(), id)
                const tgl = q.substring(0, q.indexOf('|') - 1)
                const bln = q.substring(q.indexOf('|') + 2, q.lastIndexOf('|') - 1)
                const thn = q.substring(q.lastIndexOf('|') + 2)
                await bocchi.reply(from, ind.wait(), id)
			    fun.weton(tgl, bln, thn)
                    .then(async ({ result }) => {
                        if (result.response !== 200) return await bocchi.reply(from, 'Invalid!', id)
                        await bocchi.reply(from, result.hasil, id)
                        console.log('Success sending weton info!')
                    })
                    .catch(async (err) => {
                        console.error(err)
                        await bocchi.reply(from, `Error!\n${err}`, id)
                    })
            break

            // Sticker
            case 'sticker':
            case 'stiker':
                if (!isRegistered) return await bocchi.reply(from, ind.notRegistered(), id)
                if (isMedia && type === 'image' || isQuotedImage) {
                    await bocchi.reply(from, ind.wait(), id)
                    const encryptMedia = isQuotedImage ? quotedMsg : message
                    const _mimetype = isQuotedImage ? quotedMsg.mimetype : mimetype
                    const mediaData = await decryptMedia(encryptMedia, uaOverride)
                    const imageBase64 = `data:${_mimetype};base64,${mediaData.toString('base64')}`
                    await bocchi.sendImageAsSticker(from, imageBase64)
                        .then(async () => {
                            await bocchi.sendText(from, ind.ok())
                            console.log(`Sticker processed for ${processTime(t, moment())} seconds`)
                        })
                        .catch(async (err) => {
                            console.error(err)
                            await bocchi.reply(from, `Error!\n${err}`, id)
                        })
                } else {
                    await bocchi.reply(from, ind.wrongFormat(), id)
                }
            break
            case 'stickergif':
            case 'stikergif':
                if (!isRegistered) return await bocchi.reply(from, ind.notRegistered(), id)
                if (isMedia && type === 'video' || mimetype === 'image/gif') {
                    await bocchi.reply(from, ind.wait(), id)
                    try {
                        const mediaData = await decryptMedia(message, uaOverride)
                        const videoBase64 = `data:${mimetype};base64,${mediaData.toString('base64')}`
                        await bocchi.sendMp4AsSticker(from, videoBase64, { fps: 24, startTime: `00:00:00.0`, endTime : `00:00:05.0`, loop: 0 })
                            .then(async () => {
                                console.log(`Sticker processed for ${processTime(t, moment())} seconds`)
                                await bocchi.sendText(from, ind.ok())
                            })
                    } catch (err) {
                        console.error(err)
                        await bocchi.reply(from, ind.videoLimit(), id)
                    }
                } else if (isQuotedGif || isQuotedVideo) {
                    await bocchi.reply(from, ind.wait(), id)
                    try {
                        const mediaData = await decryptMedia(quotedMsg, uaOverride)
                        const videoBase64 = `data:${quotedMsg.mimetype};base64,${mediaData.toString('base64')}`
                        await bocchi.sendMp4AsSticker(from, videoBase64, { fps: 30, startTime: `00:00:00.0`, endTime : `00:00:03.0`, loop: 0 })
                            .then(async () => {
                                console.log(`Sticker processed for ${processTime(t, moment())} seconds`)
                                await bocchi.sendText(from, ind.ok())
                            })
                    } catch (err) {
                        console.error(err)
                        await bocchi.reply(from, ind.videoLimit(), id)
                    }
                } else {
                    await bocchi.reply(from, ind.wrongFormat(), id)
                }
            break
            case 'stickerlightning':
            case 'slightning':
                if (!isRegistered) return await bocchi.reply(from, ind.notRegistered(), id)
                if (isMedia && type === 'image' || isQuotedImage) {
                    await bocchi.reply(from, ind.wait(), id)
                    const encryptMedia = isQuotedImage ? quotedMsg : message
                    const mediaData = await decryptMedia(encryptMedia, uaOverride)
                    const imageLink = await uploadImages(mediaData, `lightning.${sender.id}`)
                    sticker.stickerLight(imageLink)
                        .then(async ({ result }) => {
                            await bocchi.sendStickerfromUrl(from, result.imgUrl)
                                .then(async () => {
                                    console.log(`Sticker processed for ${processTime(t, moment())} seconds`)
                                    await bocchi.sendText(from, ind.ok())
                                })
                        })
                        .catch(async (err) => {
                            console.error(err)
                            await bocchi.reply(from, `Error!\n${err}`, id)
                        })
                } else {
                    await bocchi.reply(from, ind.wrongFormat(), id)
                }
            break
            case 'stickerfire':
            case 'sfire':
                if (!isRegistered) return await bocchi.reply(from, ind.notRegistered(), id)
                if (isMedia && type === 'image' || isQuotedImage) {
                    await bocchi.reply(from, ind.wait(), id)
                    const encryptMedia = isQuotedImage ? quotedMsg : message
                    const mediaData = await decryptMedia(encryptMedia, uaOverride)
                    const imageLink = await uploadImages(mediaData, `fire.${sender.id}`)
                    sticker.stickerFire(imageLink)
                        .then(async ({ result }) => {
                            await bocchi.sendStickerfromUrl(from, result.imgUrl)
                                .then(async () => {
                                    console.log(`Sticker processed for ${processTime(t, moment())} seconds`)
                                    await bocchi.sendText(from, ind.ok())
                                })
                        })
                        .catch(async (err) => {
                            console.error(err)
                            await bocchi.reply(from, `Error!\n${err}`, id)
                        })
                } else {
                    await bocchi.reply(from, ind.wrongFormat(), err)
                }
            break
            case 'ttg':
                if (!isRegistered) return await bocchi.reply(from, ind.notRegistered(), id)
                if (!q) return await bocchi.reply(from, ind.wrongFormat(), id)
                await bocchi.reply(from, ind.wait(), id)
                await bocchi.sendStickerfromUrl(from, `https://api.vhtear.com/textxgif?text=${q}&apikey=${config.vhtear}`)
                    .then(() => console.log('Success creating GIF!'))
                    .catch(async (err) => {
                        console.error(err)
                        await bocchi.reply(from, `Error!\n${err}`, id)
                    })
            break
            case 'stickertoimg':
            case 'stikertoimg':
            case 'toimg':
                if (!isRegistered) return await bocchi.reply(from, ind.notRegistered(), id)
                if (isQuotedSticker) {
                    await bocchi.reply(from, ind.wait(), id)
                    try {
                        const mediaData = await decryptMedia(quotedMsg, uaOverride)
                        const imageBase64 = `data:${quotedMsg.mimetype};base64,${mediaData.toString('base64')}`
                        await bocchi.sendFile(from, imageBase64, 'sticker.jpg', '', id)
                    } catch (err) {
                        console.error(err)
                        await bocchi.reply(from, `Error!\n${err}`, id)
                    }
                } else {
                    await bocchi.reply(from, ind.wrongFormat(), id)
                }
            break

            // NSFW
            case 'multilewds':
            case 'multilewd':
            case 'mlewds':
            case 'mlewd':
                // Premium feature, contact the owner.
                if (!isRegistered) return await bocchi.reply(from, ind.notRegistered(), id)
                if (isGroupMsg) {
                    if (!isNsfw) return await bocchi.reply(from, ind.notNsfw(), id)
                    if (!isPremium) return await bocchi.reply(from, ind.notPremium(), id)
                    await bocchi.reply(from, ind.botNotPremium(), id)
                } else {
                    if (!isPremium) return await bocchi.reply(from, ind.notPremium(), id)
                    await bocchi.reply(from, ind.botNotPremium(), id)
                }
            break
            case 'multifetish':
            case 'mfetish':
                // Premium feature, contact the owner.
                if (!isRegistered) return await bocchi.reply(from, ind.notRegistered(), id)
                if (isGroupMsg) {
                    if (!isNsfw) return await bocchi.reply(from, ind.notNsfw(), id)
                    if (!isPremium) return await bocchi.reply(from, ind.notPremium(), id)
                    await bocchi.reply(from, ind.botNotPremium(), id)
                } else {
                    if (!isPremium) return await bocchi.reply(from, ind.notPremium(), id)
                    await bocchi.reply(from, ind.botNotPremium(), id)
                }
            break
            case 'lewds':
            case 'lewd':
                if (!isRegistered) return await bocchi.reply(from, ind.notRegistered(), id)
                if (isGroupMsg) {
                    if (!isNsfw) return await bocchi.reply(from, ind.notNsfw(), id)
                    await bocchi.reply(from, ind.wait(), id)
                    nsfw.randomLewd()
                        .then(async ({ url }) => {
                            await bocchi.sendFileFromUrl(from, url, 'lewd.jpg', '', null, null, true)
                                .then(() => console.log('Success sending lewd!'))
                        })
                        .catch(async (err) => {
                            console.error(err)
                            await bocchi.reply(from, `Error!\n${err}`, id)
                        })
                } else {
                    await bocchi.reply(from, ind.wait(), id)
                    nsfw.randomLewd()
                        .then(async ({ url }) => {
                            await bocchi.sendFileFromUrl(from, url, 'lewd.jpg', '', null, null, true)
                                .then(() => console.log('Success sending lewd!'))
                        })
                        .catch(async (err) => {
                            console.error(err)
                            await bocchi.reply(from, `Error!\n${err}`, id)
                        })
                }
            break
            case 'fetish':
                if (!isRegistered) return await bocchi.reply(from, ind.notRegistered(), id)
                if (ar.length !== 1) return await bocchi.reply(from, ind.wrongFormat(), id)
                if (isGroupMsg) {
                    if (!isNsfw) return await bocchi.reply(from, ind.notNsfw(), id)
                    await bocchi.reply(from, ind.wait(), id)
                    try {
                        if (ar[0] === 'armpits') {
                            nsfw.armpits()
                                .then(async ({ url }) => {
                                    await bocchi.sendFileFromUrl(from, url, 'armpits.jpg', '', id)
                                        .then(() => console.log('Success sending armpits pic!'))
                                })
                        } else if (ar[0] === 'feets') {
                            nsfw.feets()
                                .then(async ({ url }) => {
                                    await bocchi.sendFileFromUrl(from, url, 'feets.jpg', '', id)
                                        .then(() => console.log('Success sending feets pic!'))
                                })
                        } else if (ar[0] === 'thighs') {
                            nsfw.thighs()
                                .then(async ({ url }) => {
                                    await bocchi.sendFileFromUrl(from, url, 'thighs.jpg', '', id)
                                        .then(() => console.log('Success sending thighs pic!'))
                                })
                        } else if (ar[0] === 'ass') {
                            nsfw.ass()
                                .then(async ({ url }) => {
                                    await bocchi.sendFileFromUrl(from, url, 'ass.jpg', '', id)
                                        .then(() => console.log('Success sending ass pic!'))
                                })
                        } else if (ar[0] === 'boobs') {
                            nsfw.boobs()
                                .then(async ({ url }) => {
                                    await bocchi.sendFileFromUrl(from, url, 'boobs.jpg', '', id)
                                        .then(() => console.log('Success sending boobs pic!'))
                                })
                        } else if (ar[0] === 'belly') {
                            nsfw.belly()
                                .then(async ({ url }) => {
                                    await bocchi.sendFileFromUrl(from, url, 'belly.jpg', '', id)
                                        .then(() => console.log('Success sending belly pic!'))
                                })
                        } else if (ar[0] === 'sideboobs') {
                            nsfw.sideboobs()
                                .then(async ({ url }) => {
                                    await bocchi.sendFileFromUrl(from, url, 'sideboobs.jpg', '', id)
                                        .then(() => console.log('Success sending sideboobs pic!'))
                                })
                        } else if (ar[0] === 'ahegao') {
                            nsfw.ahegao()
                                .then(async ({ url }) => {
                                    await bocchi.sendFileFromUrl(from, url, 'ahegao.jpg', '', id)
                                        .then(() => console.log('Success sending ahegao pic!'))
                                })
                        } else {
                            await bocchi.reply(from, 'Tag not found.', id)
                        }
                    } catch (err) {
                        console.error(err)
                        await bocchi.reply(from, err, id)
                    }
                } else {
                    await bocchi.reply(from, ind.wait(), id)
                    try {
                        if (ar[0] === 'armpits') {
                            nsfw.armpits()
                                .then(async ({ url }) => {
                                    await bocchi.sendFileFromUrl(from, url, 'armpits.jpg', '', id)
                                        .then(() => console.log('Success sending armpits pic!'))
                                })
                        } else if (ar[0] === 'feets') {
                            nsfw.feets()
                                .then(async ({ url }) => {
                                    await bocchi.sendFileFromUrl(from, url, 'feets.jpg', '', id)
                                        .then(() => console.log('Success sending feets pic!'))
                                })
                        } else if (ar[0] === 'thighs') {
                            nsfw.thighs()
                                .then(async ({ url }) => {
                                    await bocchi.sendFileFromUrl(from, url, 'thighs.jpg', '', id)
                                        .then(() => console.log('Success sending thighs pic!'))
                                })
                        } else if (ar[0] === 'ass') {
                            nsfw.ass()
                                .then(async ({ url }) => {
                                    await bocchi.sendFileFromUrl(from, url, 'ass.jpg', '', id)
                                        .then(() => console.log('Success sending ass pic!'))
                                })
                        } else if (ar[0] === 'boobs') {
                            nsfw.boobs()
                                .then(async ({ url }) => {
                                    await bocchi.sendFileFromUrl(from, url, 'boobs.jpg', '', id)
                                        .then(() => console.log('Success sending boobs pic!'))
                                })
                        } else if (ar[0] === 'belly') {
                            nsfw.belly()
                                .then(async ({ url }) => {
                                    await bocchi.sendFileFromUrl(from, url, 'belly.jpg', '', id)
                                        .then(() => console.log('Success sending belly pic!'))
                                })
                        } else if (ar[0] === 'sideboobs') {
                            nsfw.sideboobs()
                                .then(async ({ url }) => {
                                    await bocchi.sendFileFromUrl(from, url, 'sideboobs.jpg', '', id)
                                        .then(() => console.log('Success sending sideboobs pic!'))
                                })
                        } else if (ar[0] === 'ahegao') {
                            nsfw.ahegao()
                                .then(async ({ url }) => {
                                    await bocchi.sendFileFromUrl(from, url, 'ahegao.jpg', '', id)
                                        .then(() => console.log('Success sending ahegao pic!'))
                                })
                        } else {
                            await bocchi.reply(from, 'Tag not found.', id)
                        }
                    } catch (err) {
                        console.error(err)
                        await bocchi.reply(from, `Error!\n${err}`, id)
                    }
                }
            break
            case 'nh':
                if (!isRegistered) return await bocchi.reply(from, ind.notRegistered(), id)
                const kode = args[0]
                if (!kode) return await bocchi.reply(from, ind.wrongFormat(), id)
                if (isGroupMsg) {
                    if (!isNsfw) return await bocchi.reply(from, ind.notNsfw(), id)
                    await bocchi.reply(from, ind.wait(), id)
                    console.log(`Searching nHentai for ${kode}...`)
                    const validate = await nhentai.exists(kode)
                    if (validate === true) {
                        try {
                            const pic = await api.getBook(kode)
                                .then((book) => {
                                     return api.getImageURL(book.cover)
                                })
                            const dojin = await nhentai.getDoujin(kode)
                            const { title, details, link } = dojin
                            const { tags, artists, languages, categories } = await details
                            let teks = `*Title*: ${title}\n\n*Tags*: ${tags.join(', ')}\n\n*Artists*: ${artists}\n\n*Languages*: ${languages.join(', ')}\n\n*Categories*: ${categories}\n\n*Link*: ${link}`
                            await bocchi.sendFileFromUrl(from, pic, 'nhentai.jpg', teks, id)
                                .then(() => console.log('Success sending nHentai info!'))
                        } catch (err) {
                            console.error(err)
                            await bocchi.reply(from, `Error!\n${err}`, id)
                        }
                    } else {
                        await bocchi.reply(from, ind.nhFalse(), id)
                    }
                } else {
                    await bocchi.reply(from, ind.wait(), id)
                    console.log(`Searching nHentai for ${kode}...`)
                    const validate = await nhentai.exists(kode)
                    if (validate === true) {
                        try {
                            const pic = await api.getBook(kode)
                                .then((book) => {
                                     return api.getImageURL(book.cover)
                                })
                            const dojin = await nhentai.getDoujin(kode)
                            const { title, details, link } = dojin
                            const { tags, artists, languages, categories } = await details
                            let teks = `*Title*: ${title}\n\n*Tags*: ${tags.join(', ')}\n\n*Artists*: ${artists}\n\n*Languages*: ${languages.join(', ')}\n\n*Categories*: ${categories}\n\n*Link*: ${link}`
                            await bocchi.sendFileFromUrl(from, pic, 'nhentai.jpg', teks, id)
                                .then(() => console.log('Success sending nHentai info!'))
                        } catch (err) {
                            console.error(err)
                            await bocchi.reply(from, `Error!\n${err}`, id)
                        }
                    } else {
                        await bocchi.reply(from, ind.nhFalse(), id)
                    }
                }
            break
            case 'nhdl':
                // Premium feature, contact the owner.
                if (!isRegistered) return await bocchi.reply(from, ind.notRegistered(), id)
                if (isGroupMsg) {
                    if (!isNsfw) return await bocchi.reply(from, ind.notNsfw(), id)
                    if (!isPremium) return await bocchi.reply(from, ind.notPremium(), id)
                    await bocchi.reply(from, ind.botNotPremium(), id)
                } else {
                    if (!isPremium) return await bocchi.reply(from, ind.notPremium(), id)
                    await bocchi.reply(from, ind.botNotPremium(), id)
                }
            break
            case 'nekopoi': // Thanks to ArugaZ
                if (!isRegistered) return await bocchi.reply(from, ind.notRegistered(), id)
                if (isGroupMsg) {
                    if (!isNsfw) return await bocchi.reply(from, ind.notNsfw(), id)
                    await bocchi.reply(from, ind.wait(), id)
                    nsfw.getLatest()
                        .then((result) => {
                            nsfw.getVideo(result.link)
                                .then(async (res) => {
                                    let heheq = '\n'
                                    for (let i of res.links) {
                                        heheq += `${i}\n`
                                    }
                                    await bocchi.sendText(from, `Title: ${res.title}\n\nLink:${heheq}`)
                                })
                        })
                        .catch(async (err) => {
                            console.error(err)
                            await bocchi.reply(from, `Error!\n${err}`, id)
                        })
                } else {
                    await bocchi.reply(from, ind.wait(), id)
                    nsfw.getLatest()
                        .then((result) => {
                            nsfw.getVideo(result.link)
                                .then(async (res) => {
                                    let heheq = '\n'
                                    for (let i of res.links) {
                                        heheq += `${i}\n`
                                    }
                                    await bocchi.sendText(from, `Title: ${res.title}\n\nLink:${heheq}`)
                                })
                        })
                        .catch(async (err) => {
                            console.error(err)
                            await bocchi.reply(from, `Error!\n${err}`, id)
                        })
                }
            break
            case 'waifu18':
                if (!isRegistered) return await bocchi.reply(from, ind.notRegistered(), id)
                if (isGroupMsg) {
                    if (!isNsfw) return await bocchi.reply(from, ind.notNsfw(), id)
                    await bocchi.reply(from, ind.wait(), id)
                    weeaboo.waifu(true)
                        .then(async ({ url }) => {
                            await bocchi.sendFileFromUrl(from, url, 'waifu.png', '', id)
                                .then(() => console.log('Success sending waifu!'))
                        })
                        .catch(async (err) => {
                            console.error(err)
                            await bocchi.reply(from, `Error!\n${err}`, id)
                        })
                } else {
                    await bocchi.reply(from, ind.wait(), id)
                    weeaboo.waifu(true)
                        .then(async ({ url }) => {
                            await bocchi.sendFileFromUrl(from, url, 'waifu.png', '', id)
                                .then(() => console.log('Success sending waifu!'))
                        })
                        .catch(async (err) => {
                            console.error(err)
                            await bocchi.reply(from, `Error!\n${err}`, id)
                        })
                }
            break
            case 'phdl':
                if (!isRegistered) return await bocchi.reply(from, ind.notRegistered(), id)
                if (isGroupMsg) {
                    if (!isNsfw) return await bocchi.reply(from, ind.notNsfw(), id)
                    if (!isUrl(url) && !url.includes('pornhub.com')) return await bocchi.reply(from, ind.wrongFormat(), id)
                    await bocchi.reply(from, ind.wait(), id)
                    try {
                        nsfw.phDl(url)
                            .then(async ({ title, download_urls, thumbnail_url }) => {
                                const count = Object.keys(download_urls).length
                                if (count !== 2) {
                                    const shortsLow = await misc.shortener(download_urls['240P'])
                                    const shortsMid = await misc.shortener(download_urls['480P'])
                                    const shortsHigh = await misc.shortener(download_urls['720P'])
                                    await bocchi.sendFileFromUrl(from, thumbnail_url, `${title}`, `Title: ${title}\n\nLinks:\n${shortsLow} (240P)\n${shortsMid} (480P)\n${shortsHigh} (720P)`, id)
                                        .then(() => console.log('Success sending pornhub metadata!'))
                                } else {
                                    const shortsLow = await misc.shortener(download_urls['240P'])
                                    await bocchi.sendFileFromUrl(from, thumbnail_url, `${title}`, `Title: ${title}\n\nLinks:\n${shortsLow} (240P)`, id)
                                        .then(() => console.log('Success sending pornhub metadata!'))
                                }
                            })
                    } catch (err) {
                        console.error(err)
                        await bocchi.reply(from, `Error!\n${err}`, id)
                    }
                } else {
                    if (!isUrl(url) && !url.includes('pornhub.com')) return await bocchi.reply(from, ind.wrongFormat(), id)
                    await bocchi.reply(from, ind.wait(), id)
                    try {
                        nsfw.phDl(url)
                            .then(async ({ title, download_urls, thumbnail_url }) => {
                                const count = Object.keys(download_urls).length
                                if (count !== 2) {
                                    const shortsLow = await misc.shortener(download_urls['240P'])
                                    const shortsMid = await misc.shortener(download_urls['480P'])
                                    const shortsHigh = await misc.shortener(download_urls['720P'])
                                    await bocchi.sendFileFromUrl(from, thumbnail_url, `${title}`, `Title: ${title}\n\nLinks:\n${shortsLow} (240P)\n${shortsMid} (480P)\n${shortsHigh} (720P)`, id)
                                        .then(() => console.log('Success sending pornhub metadata!'))
                                } else {
                                    const shortsLow = await misc.shortener(download_urls['240P'])
                                    await bocchi.sendFileFromUrl(from, thumbnail_url, `${title}`, `Title: ${title}\n\nLinks:\n${shortsLow} (240P)`, id)
                                        .then(() => console.log('Success sending pornhub metadata!'))
                                }
                            })
                    } catch (err) {
                        console.error(err)
                        await bocchi.reply(from, `Error!\n${err}`, id)
                    }
                }
            break

            // Moderation command
	        case 'mutegc':
	        case 'mute': 
	            if (!isRegistered) return await bocchi.reply(from, ind.notRegistered(), id)
		        if (!isGroupMsg) return bocchi.reply(from, ind.groupOnly(), id)
                if (!isGroupAdmins) return bocchi.reply(from, ind.adminOnly(), id)
                if (!isBotGroupAdmins) return bocchi.reply(from, ind.botNotAdmin(), id)
                if (ar[0] === 'enable') {
                    await bocchi.setGroupToAdminsOnly(groupId, true)
                    await bocchi.sendText(from, ind.gcMute())
	            } else if (ar[0] === 'disable') {
                    await bocchi.setGroupToAdminsOnly(groupId, false)
                    await bocchi.sendText(from, ind.gcUnmute())
		        } else {
		            await bocchi.reply(from, ind.wrongFormat(), id)
                }
	        break
            case 'add':
                if (!isRegistered) return await bocchi.reply(from, ind.notRegistered(), id)
                if (!isGroupMsg) return await bocchi.reply(from, ind.groupOnly(), id)
                if (!isGroupAdmins) return await bocchi.reply(from, ind.adminOnly(), id)
                if (!isBotGroupAdmins) return await bocchi.reply(from, ind.botNotAdmin(), id)
                if (args.length !== 1) return await bocchi.reply(from, ind.wrongFormat(), id)
                try {
                    await bocchi.addParticipant(from, `${args[0]}@c.us`)
                    await bocchi.sendText(from, '🎉 Welcome! 🎉')
                } catch (err) {
                    console.error(err)
                    await bocchi.reply(from, `Error!\n${err}`, id)
                }
            break
            case 'kick':
                if (!isRegistered) return await bocchi.reply(from, ind.notRegistered(), id)
                if (!isGroupMsg) return await bocchi.reply(from, ind.groupOnly(), id)
                if (!isGroupAdmins) return await bocchi.reply(from, ind.adminOnly(), id)
                if (!isBotGroupAdmins) return await bocchi.reply(from, ind.botNotAdmin(), id)
                if (mentionedJidList.length === 0) return await bocchi.reply(from, ind.wrongFormat(), id)
                if (mentionedJidList[0] === botNumber) return await bocchi.reply(from, ind.wrongFormat(), id)
                await bocchi.sendTextWithMentions(from, `Good bye~\n${mentionedJidList.map(x => `@${x.replace('@c.us', '')}`).join('\n')}`)
                for (let i of mentionedJidList) {
                    if (groupAdmins.includes(i)) return await bocchi.sendText(from, ind.wrongFormat())
                    await bocchi.removeParticipant(groupId, i)
                }
            break
            case 'promote':
                if (!isRegistered) return await bocchi.reply(from, ind.notRegistered(), id)
                if (!isGroupMsg) return await bocchi.reply(from, ind.groupOnly(), id)
                if (!isGroupAdmins) return await bocchi.reply(from, ind.adminOnly(), id)
                if (!isBotGroupAdmins) return await bocchi.reply(from, ind.botNotAdmin(), id)
                if (mentionedJidList.length !== 1) return await bocchi.reply(from, ind.wrongFormat(), id)
                if (mentionedJidList[0] === botNumber) return await bocchi.reply(from, ind.wrongFormat(), id)
                if (groupAdmins.includes(mentionedJidList[0])) return await bocchi.reply(from, ind.adminAlready(), id)
                await bocchi.promoteParticipant(groupId, mentionedJidList[0])
                await bocchi.reply(from, ind.ok(), id)
            break
            case 'demote':
                if (!isRegistered) return await bocchi.reply(from, ind.notRegistered(), id)
                if (!isGroupMsg) return await bocchi.reply(from, ind.groupOnly(), id)
                if (!isGroupAdmins) return await bocchi.reply(from, ind.adminOnly(), id)
                if (!isBotGroupAdmins) return await bocchi.reply(from, ind.botNotAdmin(), id)
                if (mentionedJidList.length !== 1) return await bocchi.reply(from, ind.wrongFormat(), id)
                if (mentionedJidList[0] === botNumber) return await bocchi.reply(from, ind.wrongFormat(), id)
                if (!groupAdmins.includes(mentionedJidList[0])) return await bocchi.reply(from, ind.notAdmin(), id)
                await bocchi.demoteParticipant(groupId, mentionedJidList[0])
                await bocchi.reply(from, ind.ok(), id)
            break
            case 'leave':
                if (!isRegistered) return await bocchi.reply(from, ind.notRegistered(), id)
                if (!isGroupMsg) return await bocchi.reply(from, ind.groupOnly(), id)
                if (!isGroupAdmins) return await bocchi.reply(from, ind.adminOnly(), id)
                await bocchi.sendText(from, 'Sayounara~ 👋')
                await bocchi.leaveGroup(groupId)
            break
            case 'everyone': // Thanks to ArugaZ
                if (!isRegistered) return await bocchi.reply(from, ind.notRegistered(), id)
                if (!isGroupMsg) return await bocchi.reply(from, ind.groupOnly(), id)
                if (!isGroupAdmins) return await bocchi.reply(from, ind.adminOnly(), id)
                const groupMem = await bocchi.getGroupMembers(groupId)
                const lastEveryone = getLimit(sender.id)
                if (lastEveryone !== undefined && cd - (Date.now() - lastEveryone) > 0) {
                    const time = ms(cd - (Date.now() - lastEveryone))
                    await bocchi.reply(from, ind.limit(time), id)
                } else if (isOwner) {
                    let txt = '╔══✪〘 Mention All 〙✪══\n'
                        for (let i = 0; i < groupMem.length; i++) {
                            txt += '╠➥'
                            txt += ` @${groupMem[i].id.replace(/@c.us/g, '')}\n`
                        }
                    txt += '╚═〘 *B O C C H I  B O T* 〙'
                    await bocchi.sendTextWithMentions(from, txt)
                } else {
                    let txt = '╔══✪〘 Mention All 〙✪══\n'
                        for (let i = 0; i < groupMem.length; i++) {
                            txt += '╠➥'
                            txt += ` @${groupMem[i].id.replace(/@c.us/g, '')}\n`
                        }
                    txt += '╚═〘 *B O C C H I  B O T* 〙'
                    await bocchi.sendTextWithMentions(from, txt)
                    addLimit(sender.id)
                }
            break
            case 'groupicon':
                if (!isRegistered) return await bocchi.reply(from, ind.notRegistered(), id)
                if (!isGroupMsg) return await bocchi.reply(from, ind.groupOnly(), id)
                if (!isGroupAdmins) return await bocchi.reply(from, ind.adminOnly(), id)
                if (!isBotGroupAdmins) return bocchi.reply(from, ind.botNotAdmin(), id)
                if (isMedia && type === 'image' || isQuotedImage) {
                    await bocchi.reply(from, ind.wait(), id)
                    const encryptMedia = isQuotedImage ? quotedMsg : message
                    const _mimetype = isQuotedImage ? quotedMsg.mimetype : mimetype
                    const mediaData = await decryptMedia(encryptMedia, uaOverride)
                    const imageBase64 = `data:${_mimetype};base64,${mediaData.toString('base64')}`
                    await bocchi.setGroupIcon(groupId, imageBase64)
                    await bocchi.sendText(from, ind.ok())
                } else {
                    await bocchi.reply(from, ind.wrongFormat(), id)
                }
            break
            case 'antilink':
                if (!isRegistered) return await bocchi.reply(from, ind.notRegistered(), id)
                if (!isGroupMsg) return await bocchi.reply(from, ind.groupOnly(), id)
                if (!isGroupAdmins) return await bocchi.reply(from, ind.adminOnly(), id)
                if (!isBotGroupAdmins) return await bocchi.reply(from, ind.botNotAdmin(), id)
                if (ar[0] === 'enable') {
                    if (isDetectorOn) return await bocchi.reply(from, ind.detectorOnAlready(), id)
                    _antilink.push(chat.id)
                    fs.writeFileSync('./database/antilink.json', JSON.stringify(_antilink))
                    await bocchi.reply(from, ind.detectorOn(name, formattedTitle), id)
                } else if (ar[0] === 'disable') {
                    _antilink.splice(chat.id, 1)
                    fs.writeFileSync('./database/antilink.json', JSON.stringify(_antilink))
                    await bocchi.reply(from, ind.detectorOff(), id)
                } else {
                    await bocchi.reply(from, ind.wrongFormat(), id)
                }
            break
            case 'leveling':
                if (!isRegistered) return await bocchi.reply(from, ind.notRegistered(), id)
                if (!isGroupMsg) return await bocchi.reply(from, ind.groupOnly(), id)
                if (!isGroupAdmins) return await bocchi.reply(from, ind.adminOnly(), id)
                if (ar[0] === 'enable') {
                    if (isLevelingOn) return await bocchi.reply(from, ind.levelingOnAlready(), id)
                    _leveling.push(chat.id)
                    fs.writeFileSync('./database/leveling.json', JSON.stringify(_leveling))
                    await bocchi.reply(from, ind.levelingOn(), id)
                } else if (ar[0] === 'disable') {
                    _leveling.splice(chat.id, 1)
                    fs.writeFileSync('./database/leveling.json', JSON.stringify(_leveling))
                    await bocchi.reply(from, ind.levelingOff(), id)
                } else {
                    await bocchi.reply(from, ind.wrongFormat(), id)
                }
            break
            case 'welcome':
                if (!isRegistered) return await bocchi.reply(from, ind.notRegistered(), id)
                if (!isGroupMsg) return await bocchi.reply(from, ind.groupOnly(), id)
                if (!isGroupAdmins) return await bocchi.reply(from, ind.adminOnly(), id)
                if (ar[0] === 'enable') {
                    if (isWelcomeOn) return await bocchi.reply(from, ind.welcomeOnAlready(), id)
                    _welcome.push(chat.id)
                    fs.writeFileSync('./database/welcome.json', JSON.stringify(_welcome))
                    await bocchi.reply(from, ind.welcomeOn(), id)
                } else if (ar[0] === 'disable') {
                    _welcome.splice(chat.id, 1)
                    fs.writeFileSync('./database/welcome.json', JSON.stringify(_welcome))
                    await bocchi.reply(from, ind.welcomeOff(), id)
                } else {
                    await bocchi.reply(from, ind.wrongFormat(), id)
                }
            break
            case 'autosticker':
	        case 'autostiker':
            case 'autostik':
                if (!isRegistered) return await bocchi.reply(from, ind.notRegistered(), id)
                if (!isGroupMsg) return await bocchi.reply(from, ind.groupOnly(), id)
                if (!isGroupAdmins) return await bocchi.reply(from, ind.adminOnly(), id)
                if (ar[0] === 'enable') {
                    if (isAutoStikerOn) return await bocchi.reply(from, ind.autoStikOnAlready(), id)
                    _autostiker.push(chat.id)
                    fs.writeFileSync('./database/autostiker.json', JSON.stringify(_autostiker))
                    await bocchi.reply(from, ind.autoStikOn(), id)
                } else if (ar[0] === 'disable') {
                    _autostiker.splice(chat.id, 1)
                    fs.writeFileSync('./database/autostiker.json', JSON.stringify(_autostiker))
                    await bocchi.reply(from, ind.autoStikOff(), id)
                } else {
                    await bocchi.reply(from, ind.wrongFormat(), id)
                }
            break

            // Owner command
            case 'bc':
                if (!isOwner) return await bocchi.reply(from, ind.ownerOnly(), id)
                if (!q) return await bocchi.reply(from, ind.emptyMess(), id)
                const chats = await bocchi.getAllChatIds()
                for (let bcs of chats) {
                    let cvk = await bocchi.getChatById(bcs)
                    if (!cvk.isReadOnly) await bocchi.sendText(bcs, `${q}\n\n- Slavyan (Kal)\n_Broadcasted message_`)
                }
                await bocchi.reply(from, ind.doneOwner(), id)
            break
            case 'clearall':
                if (!isOwner) return await bocchi.reply(from, ind.ownerOnly(), id)
                const allChats = await bocchi.getAllChats()
                for (let delChats of allChats) {
                    await bocchi.deleteChat(delChats.id)
                }
                await bocchi.reply(from, ind.doneOwner(), id)
            break
            case 'leaveall':
                if (!isOwner) return await bocchi.reply(from, ind.ownerOnly(), id)
                if (!q) return await bocchi.reply(from, ind.emptyMess(), id)
                const allGroup = await bocchi.getAllGroups()
                for (let gclist of allGroup) {
                    await bocchi.sendText(gclist.contact.id, q)
                    await bocchi.leaveGroup(gclist.contact.id)
                   
                }
                await bocchi.reply(from, ind.doneOwner())
            break
            case 'getses':
                if (!isOwner) return await bocchi.reply(from, ind.ownerOnly(), id)
                const ses = await bocchi.getSnapshot()
                await bocchi.sendFile(from, ses, 'session.png', ind.doneOwner())
            break
            case 'ban':
                if (!isOwner) return await bocchi.reply(from, ind.ownerOnly(), id)
                if (ar[0] === 'add') {
                    if (mentionedJidList.length !== 0) {
                        for (let benet of mentionedJidList) {
                            if (benet === botNumber) return await bocchi.reply(from, ind.wrongFormat(), id)
                            _ban.push(benet)
                            fs.writeFileSync('./database/banned.json', JSON.stringify(_ban))
                        }
                        await bocchi.reply(from, ind.doneOwner(), id)
                    } else {
                        _ban.push(args[0] + '@c.us')
                        fs.writeFileSync('./database/banned.json', JSON.stringify(_ban))
                        await bocchi.reply(from, ind.doneOwner(), id)
                    }
                } else if (ar[0] === 'del') {
                    if (mentionedJidList.length !== 0) {
                        if (mentionedJidList[0] === botNumber) return await bocchi.reply(from, ind.wrongFormat(), id)
                        _ban.splice(_ban.indexOf(mentionedJidList[0]), 1)
                        fs.writeFileSync('./database/banned.json', JSON.stringify(_ban))
                        await bocchi.reply(from, ind.doneOwner(), id)
                    } else{
                        _ban.splice(args[0] + '@c.us', 1)
                        fs.writeFileSync('./database/banned.json', JSON.stringify(_ban))
                        await bocchi.reply(from, ind.doneOwner(), id)
                    }
                } else {
                    await bocchi.reply(from, ind.wrongFormat(), id)
                }
            break
            case 'eval':
            case 'ev':
                if (!isOwner) return await bocchi.reply(from, ind.ownerOnly(), id)
                if (!q) return await bocchi.reply(from, ind.wrongFormat(), id)
                try {
                    let evaled = await eval(q)
                    if (typeof evaled !== 'string') evaled = require('util').inspect(evaled)
                    await bocchi.sendText(from, evaled)
                } catch (err) {
                    console.error(err)
                    await bocchi.reply(from, `Error!\n${err}`, id)
                }
            break
            case 'shutdown':
                if (!isOwner) return await bocchi.reply(from, ind.ownerOnly(), id)
                await bocchi.sendText(from, 'Otsukaresama deshita~ 👋')
                    .then(async () => await bocchi.kill())
                    .catch(() => console.error('Target closed.'))
            break
            case 'premium':
                if (!isOwner) return await bocchi.reply(from, ind.ownerOnly(), id)
                if (ar[0] === 'add') {
                    for (let premi of mentionedJidList) {
                        if (premi === botNumber) return await bocchi.reply(from, ind.wrongFormat(), id)
                        _premium.push(premi)
                        fs.writeFileSync('./database/premium.json', JSON.stringify(_premium))
                    }
                    await bocchi.reply(from, ind.doneOwner(), id)
                } else if (ar[0] === 'del') {
                    if (mentionedJidList[0] === botNumber) return await bocchi.reply(from, ind.wrongFormat(), id)
                    let predel = _premium.indexOf(mentionedJidList[0])
                    _premium.splice(predel, 1)
                    fs.writeFileSync('./database/premium.json', JSON.stringify(_premium))
                    await bocchi.reply(from, ind.doneOwner(), id)
                } else {
                    await bocchi.reply(from, ind.wrongFormat(), id)
                }
            break
            case 'setstatus':
            case 'setstats':
            case 'setstat':
                if (!isOwner) return await bocchi.reply(from, ind.ownerOnly(), id)
                if (!q) return await bocchi.reply(from, ind.emptyMess(), id)
                await bocchi.setMyStatus(q)
                await bocchi.sendText(from, ind.doneOwner())
            break
            case 'serial':
                if (!isOwner) return await bocchi.reply(from, ind.ownerOnly(), id)
                if (args.length !== 1) return await bocchi.reply(from, ind.wrongFormat(), id)
                const serials = args[0]
                if (checkRegisteredUserFromSerial(serials)) {
                    const name = getRegisteredNameFromSerial(serials)
                    const age = getRegisteredAgeFromSerial(serials)
                    const time = getRegisteredTimeFromSerial(serials)
                    const id = getRegisteredIdFromSerial(serials)
                    await bocchi.sendText(from, ind.registeredFound(name, age, time, serials, id))
                } else {
                    await bocchi.sendText(from, ind.registeredNotFound(serials))
                }
            break
            default:
                if (isCmd) {
                    await bocchi.reply(from, `Command ${command} tidak ditemukan.`, id)
                }
            break
        }
    } catch (err) {
        console.error(color('[ERROR]', 'red'), err)
    }
}
/********** END OF MESSAGE HANDLER **********/

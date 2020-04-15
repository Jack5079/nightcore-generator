// todo: image part
// https://invidio.us/api/v1/search?q=hello&type=video
const {prompt} = require('enquirer')
const fetch = require('node-fetch')
const ffmpeg = require('fluent-ffmpeg')
const { path: ffmpegPath } = require('@ffmpeg-installer/ffmpeg')
const ytdl = require('ytdl-core')
const { promises: {writeFile}, existsSync, unlinkSync } = require('fs')
if (existsSync('./out.mp4')) {
  unlinkSync('./out.mp4')
}
ffmpeg.setFfmpegPath(ffmpegPath)

;(async function main () {
  const { search } = await prompt([{
    type: 'text',
    message: 'Search for a song.',
    name: 'search'
  }])
  const searchdata = await fetch(`https://invidio.us/api/v1/search?q=${encodeURIComponent(search)}&type=video`).then(res=>res.json())
  if (!searchdata.length) {
    console.log('No videos found.')
    return main()
  }
  const {vid} = await prompt({
    type: 'select',
    name: 'vid',
    message: 'Select a video.',
    choices: searchdata.map(video => {
      return {
        name: video,
        message: video.title
      }
    })
  })
  const {img} = await prompt({
    type: 'text',
    message: 'Search for an image.',
    name: 'img'
  })
  const buff = await fetch('https://source.unsplash.com/random/?' + encodeURIComponent(img)).then(res=>res.buffer())
  await writeFile('./img.jpg', buff)
  ffmpeg('./img.jpg')
    .input( ytdl(vid.videoId, {filter: 'audioonly'}))
    .audioCodec('aac')
    .videoCodec('mpeg4')
    .audioFilter('atempo=2.0')
    .duration(vid.lengthSeconds / 2)
    .save('./out.mp4')
    .on('progress', function () {
      console.log('Processing...')
    })
})()

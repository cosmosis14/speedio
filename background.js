chrome.runtime.onInstalled.addListener(function() {
  chrome.storage.sync.set({ isOn: true })

  chrome.browserAction.setBadgeText({text: 'On'})
  chrome.browserAction.setBadgeBackgroundColor({color: '#F00'})
})

chrome.browserAction.onClicked.addListener(function () {
  chrome.storage.sync.get('isOn', function (data) {
    if (data.isOn) {
      chrome.browserAction.setBadgeText({ text: '' })
      chrome.storage.sync.set({ isOn: false })
    } else {
      chrome.browserAction.setBadgeText({ text: 'On' })
      chrome.storage.sync.set({ isOn: true })
    }
  })
})

chrome.commands.onCommand.addListener(function(command) {
  if (command === 'speed-up') changeSpeed(0.25)
  else if (command === 'speed-down') changeSpeed(-0.25)
})

function changeSpeed(speedDiff) {
  console.log(speedDiff)

  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.executeScript(tabs[0].id,
      {
        code: `
        speedioVideos = document.getElementsByTagName('video')
        // console.log(speedioVideos)
        for (const video of speedioVideos) {
          if (video.playbackRate <= 0.25 && ${speedDiff} < 0) break
          video.playbackRate += ${speedDiff}
          console.log(video.playbackRate)
        }
        `
      })
  })
}
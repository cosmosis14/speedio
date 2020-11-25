chrome.runtime.onInstalled.addListener(function() {
  chrome.storage.sync.set({ isOn: true, speedInterval: 0.25})

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
  if (command === 'speed-up' || command === 'speed-down') {
    chrome.storage.sync.get('isOn', function (data) {
      if (data.isOn) {
        chrome.storage.sync.get('speedInterval', function (data) {
          if (command === 'speed-up') changeSpeed(data.speedInterval)
          else if (command === 'speed-down') changeSpeed(-(data.speedInterval))  
        })
      }
    })
  }
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
          if (video.playbackRate + ${speedDiff} <= 0.01) break
          video.playbackRate += ${speedDiff}
          console.log(video.playbackRate)
        }
        `
      })
  })
}
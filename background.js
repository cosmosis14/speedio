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
        var curRate
        var speedioVideos = document.getElementsByTagName('video')
        // console.log(speedioVideos)
        for (const video of speedioVideos) {
          if (video.playbackRate + ${speedDiff} <= 0.01 || video.playbackRate + ${speedDiff} > 16) break
          video.playbackRate += ${speedDiff}
          curRate = video.playbackRate
          // console.log(curRate)
        }

        var speedUpdateDiv = speedUpdateDiv ? speedUpdateDiv : document.createElement("div")
        if (speedUpdateDiv.style.visibility) {
          speedUpdateDiv.style.visibility = ''
        }
        if (speedUpdateDiv.style.length === 0) {
          speedUpdateDiv.style = "position: fixed; border: 1px solid rgb(51, 102, 153); padding: 10px; background-color: rgb(255, 255, 255); z-index: 2001; overflow: auto; text-align: center; top: 25%; left: 50%"
          // console.log('setting style')
        }
        speedUpdateDiv.innerHTML = 'Speedio: ' + curRate + 'x'

        document.body.appendChild(speedUpdateDiv)

        setTimeout(() => {
          speedUpdateDiv.style.visibility = 'hidden'
        }, 500)
        `
        // TODO: implement visual confirmation of speed change with current playback rate (fading popup in the DOM)
      })
  })
}
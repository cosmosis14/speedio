chrome.runtime.onInstalled.addListener(function() {
  // Extension is turned on by default
  chrome.storage.sync.set({ isOn: true, speedInterval: 0.25})

  chrome.browserAction.setBadgeText({text: 'On'})
  chrome.browserAction.setBadgeBackgroundColor({color: '#F00'})
})

chrome.browserAction.onClicked.addListener(function () {
  // Clicking the icon turns the extension off/on
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
  // Listeners for speed-up and speed-down commands
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

// Takes a positive/negative number, speedDiff, and speeds up/down all videos in the active tab by that number
// Also provides a popup modal notifying the user of the current video playback speed
function changeSpeed(speedDiff) {
  // time (in ms) that the speed update modal stays on screen
  const timeout = 500

  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.executeScript(tabs[0].id,
      {
        code: `
        // Clear modal timeout if function is called again before previous timeout has occurred
        var curTimeout = curTimeout ? curTimeout : 0
        if (curTimeout) clearTimeout(curTimeout)

        var curRate

        // Get parent document videos and convert to regular array
        var videoCollection = document.getElementsByTagName('video')
        var speedioVideos = []
        for (const video of videoCollection) {
          speedioVideos.push(video)
        }
        
        // add video elements within same-origin iframes
        var iframes = document.getElementsByTagName('iframe')
        for (const iframe of iframes) {
          let iframeURL
          if (iframe.src) {
            iframeURL = new URL(iframe.src)
          }
          
          if (!iframeURL || iframeURL.hostname === window.location.hostname) {
            let iframeContent = iframe.contentDocument || iframe.contentWindow.document
            let iframeVideos = iframeContent.getElementsByTagName('video')
            // console.log(iframeVideos)
            for (const video of iframeVideos) {
              speedioVideos.push(video)
            }
          }
        }
        
        // console.log(speedioVideos)
        for (const video of speedioVideos) {
          // Respect hard limits of HTML5 video playback speeds
          if (video.playbackRate + ${speedDiff} <= 0.01 || video.playbackRate + ${speedDiff} > 16) break
          video.playbackRate += ${speedDiff}
          curRate = video.playbackRate
          // console.log(curRate)
        }
        
        // Only show modal if there is a video on the current tab
        if (speedioVideos.length > 0) {
          // Reuse div if available
          var speedUpdateDiv = speedUpdateDiv ? speedUpdateDiv : document.createElement("div")

          // If visibility was set to hidden, make it visible
          if (speedUpdateDiv.style.visibility) {
            speedUpdateDiv.style.visibility = ''
          }

          // If this is the first time the function is called on the tab, set initial style
          if (speedUpdateDiv.style.length === 0) {
            speedUpdateDiv.style = "position: fixed; border: 1px solid rgb(51, 102, 153); padding: 10px; background-color: rgb(255, 255, 255); z-index: 2001; overflow: auto; text-align: center; top: 25%; left: 50%"
            // console.log('setting style')
          }
          speedUpdateDiv.innerHTML = 'Speedio: ' + curRate + 'x'
  
          document.body.appendChild(speedUpdateDiv)
          
          // Remove modal after a set time
          var curTimeout = setTimeout(() => {
            speedUpdateDiv.style.visibility = 'hidden'
            curTimeout = 0
          }, ${timeout})
        }
        `
        // TODO: fade in/out the modal
      })
  })
}
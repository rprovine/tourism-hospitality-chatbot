(function() {
  'use strict';
  
  // Configuration from script tag attributes
  const script = document.currentScript || document.querySelector('script[data-business-id]');
  const config = {
    businessId: script.getAttribute('data-business-id'),
    position: script.getAttribute('data-position') || 'bottom-right',
    primaryColor: script.getAttribute('data-primary-color') || '#0891b2',
    baseUrl: script.src.replace('/widget.js', '') || 'https://app.lenilani.com'
  };
  
  if (!config.businessId) {
    console.error('LeniLani Widget: business-id is required');
    return;
  }
  
  // Create iframe container
  const container = document.createElement('div');
  container.id = 'lenilani-chat-widget';
  container.style.cssText = `
    position: fixed;
    ${config.position.includes('right') ? 'right: 20px;' : 'left: 20px;'}
    ${config.position.includes('bottom') ? 'bottom: 20px;' : 'top: 20px;'}
    z-index: 999999;
    width: 380px;
    height: 600px;
    max-height: calc(100vh - 40px);
    max-width: calc(100vw - 40px);
    display: none;
    filter: drop-shadow(0 20px 25px rgb(0 0 0 / 0.15));
  `;
  
  // Create toggle button
  const button = document.createElement('button');
  button.id = 'lenilani-chat-button';
  button.innerHTML = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" fill="white"/>
    </svg>
  `;
  button.style.cssText = `
    position: fixed;
    ${config.position.includes('right') ? 'right: 20px;' : 'left: 20px;'}
    ${config.position.includes('bottom') ? 'bottom: 20px;' : 'top: 20px;'}
    width: 60px;
    height: 60px;
    border-radius: 30px;
    background: ${config.primaryColor};
    border: none;
    cursor: pointer;
    z-index: 999998;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transition: transform 0.2s, box-shadow 0.2s;
  `;
  
  button.onmouseover = function() {
    button.style.transform = 'scale(1.1)';
    button.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.2)';
  };
  
  button.onmouseout = function() {
    button.style.transform = 'scale(1)';
    button.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
  };
  
  
  // Create iframe
  const iframe = document.createElement('iframe');
  iframe.id = 'lenilani-chat-iframe';
  const widgetUrl = `${config.baseUrl}/widget/chat?businessId=${config.businessId}&color=${encodeURIComponent(config.primaryColor)}`;
  console.log('LeniLani Widget: Loading URL:', widgetUrl);
  console.log('LeniLani Widget: Config:', config);
  iframe.src = widgetUrl;
  iframe.style.cssText = `
    width: 100%;
    height: 100%;
    border: none;
    border-radius: 12px;
    background: white;
  `;
  iframe.setAttribute('allow', 'microphone; camera');
  
  // Append elements
  container.appendChild(iframe);
  document.body.appendChild(button);
  document.body.appendChild(container);
  
  // Toggle chat window
  let isOpen = false;
  
  function toggleChat() {
    isOpen = !isOpen;
    if (isOpen) {
      container.style.display = 'block';
      button.style.display = 'none';
      // Send message to iframe that chat is opened
      iframe.contentWindow.postMessage({ type: 'chat-opened' }, config.baseUrl);
    } else {
      container.style.display = 'none';
      button.style.display = 'flex';
    }
  }
  
  button.onclick = toggleChat;
  
  // Handle messages from iframe
  window.addEventListener('message', function(event) {
    if (event.origin !== config.baseUrl) return;
    
    if (event.data.type === 'toggle-chat') {
      toggleChat();
    } else if (event.data.type === 'resize') {
      if (event.data.height) {
        container.style.height = Math.min(event.data.height, window.innerHeight - 40) + 'px';
      }
    }
  });
  
  // Handle responsive design
  function handleResize() {
    if (window.innerWidth < 440) {
      container.style.width = 'calc(100vw - 40px)';
      container.style.height = 'calc(100vh - 100px)';
    } else {
      container.style.width = '380px';
      container.style.height = '600px';
    }
  }
  
  window.addEventListener('resize', handleResize);
  handleResize();
  
  // Auto-open based on query parameters or after delay
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('chat') === 'open') {
    setTimeout(toggleChat, 500);
  }
  
  // Optional: Show greeting after delay
  setTimeout(function() {
    if (!isOpen && !sessionStorage.getItem('lenilani-greeted')) {
      const greeting = document.createElement('div');
      greeting.style.cssText = `
        position: fixed;
        ${config.position.includes('right') ? 'right: 90px;' : 'left: 90px;'}
        ${config.position.includes('bottom') ? 'bottom: 35px;' : 'top: 35px;'}
        background: white;
        padding: 12px 16px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        z-index: 999997;
        max-width: 200px;
        animation: slideIn 0.3s ease-out;
      `;
      greeting.innerHTML = `
        <style>
          @keyframes slideIn {
            from { opacity: 0; transform: translateX(20px); }
            to { opacity: 1; transform: translateX(0); }
          }
        </style>
        <div style="font-size: 14px; color: #374151;">👋 Aloha! Need help?</div>
      `;
      document.body.appendChild(greeting);
      sessionStorage.setItem('lenilani-greeted', 'true');
      
      setTimeout(function() {
        greeting.style.animation = 'slideIn 0.3s ease-out reverse';
        setTimeout(function() {
          greeting.remove();
        }, 300);
      }, 5000);
    }
  }, 3000);
})();
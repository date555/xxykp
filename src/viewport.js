// Keep HUD, panels and native dialogs inside the same 16:9 play area.
export function setupViewport() {
  const host = document.querySelector('#game-host');
  const button = document.querySelector('#fullscreen-btn');
  function fit() {
    const scale = Math.min(host.clientWidth / 1440, host.clientHeight / 810);
    document.documentElement.style.setProperty('--game-scale', scale);
  }
  new ResizeObserver(fit).observe(host);
  window.addEventListener('resize', fit);
  document.addEventListener('fullscreenchange', () => {
    const active = !!document.fullscreenElement;
    button.setAttribute('aria-label', active ? '退出全屏' : '全屏游戏');
    button.title = active ? '退出全屏' : '全屏游戏';
    fit();
  });
  button.addEventListener('click', async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await host.requestFullscreen();
    } catch {
      button.title = '当前浏览器不支持全屏，可使用浏览器全屏功能';
    }
  });
  fit();
}

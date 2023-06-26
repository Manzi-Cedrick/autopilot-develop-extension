import {
  onToggle,
  offToggle,
  topBanner,
  autopilot,
  infoBanner,
  massMessage,
  loggerHeader,
  counterLogs,
  offToggleInner,
  onToggleInner
} from './templates';
import Messenger from '../automations/Messenger';
import Swiper from '../automations/Swiper';
import HideUnanswered from '../automations/HideUnanswered';
import Anonymous from '../automations/Anonymous';
import { waitUntilElementExists } from '../misc/helper';
import { authenticate } from '../misc/api';

class Sidebar {
  constructor() {
    this.isLoggedIn = false; 
    this.sidebar();

    this.anonymous = new Anonymous();
    this.hideUnanswered = new HideUnanswered();
    this.swiper = new Swiper();
    this.messenger = new Messenger();

    this.events();
  }

  insertBefore = (el, referenceNode) => {
    referenceNode.parentNode.insertBefore(el, referenceNode);
  };

  sidebar = () => {
    const el = document.createElement('aside');
    el.className = 'H(100%) Fld(c) Pos(r) Flxg(0) Fxs(0) Flxb(25%) Miw(325px) Maw(375px)';
    el.style.cssText = 'background-color:#1f2937;z-index:9999999;';
    el.innerHTML = infoBanner;
    this.insertBefore(el, document.querySelector('aside:first-of-type'));

    this.infoBanner = document.querySelector('#infoBanner');

    this.infoBanner.innerHTML = this.isLoggedIn ? this.getProtectedSidebarContent() : this.getLoginView();
  };

  getLoginView = () => {
    return `
      <div class="login-container">
        <h2 class="login-title">Login</h2>
        <div class="login-form">
          <label for="username" class="login-label">Username:</label>
          <input type="text" id="username" class="login-input" placeholder="Enter your username">
          <label for="password" class="login-label">Password:</label>
          <input type="password" id="password" class="login-input" placeholder="Enter your password">
          <button id="loginButton" class="login-button">Login</button>
        </div>
      </div>
    `;
  };

  getProtectedSidebarContent = () => {
    return `
      <nav class="Pos(r) H(100%) gamepad-control-off">
        <div class="H(100%)">
          <div class="Ov(h) Bgc($c-bg-lite-blue) menu Pos(r) H(100%)">
            <div class="menu__content Bgc(#c1e6f9) Pb(50px) Fz($responsiveLarge)--m H(100%) Ovs(touch) Ovx(h) Ovy(s) Ovsby(n)">
              ${topBanner}${counterLogs(0, 0)}${autopilot}${massMessage}${loggerHeader}
              <div class="txt" style="overflow-y: auto; height: 100%;"></div>
            </div>
          </div>
        </div>
      </nav>
    `;
  };

  events = () => {
    if (this.isLoggedIn) {
      waitUntilElementExists('img[alt="No Reason"]', () => {
        document.querySelector('ul li:last-of-type button').click();
        document.querySelector('.modal-slide-up div button[type="button"]').click();
      });

      this.bindCheckbox(this.anonymous.selector, this.anonymous.start, this.anonymous.stop);
      this.bindCheckbox(this.messenger.newSelector);
      this.bindCheckbox(this.swiper.selector, this.swiper.start, this.swiper.stop);
      this.bindCheckbox(this.messenger.selector, this.messenger.start, this.messenger.stop);
      this.bindCheckbox(
        this.hideUnanswered.selector,
        this.hideUnanswered.start,
        this.hideUnanswered.stop
      );

      document.getElementById('messageToSend').addEventListener('blur', (e) => {
        localStorage.setItem('TinderAutopilot/MessengerDefault', JSON.stringify(e.target.value));
      });
    } else {
      const loginButton = document.getElementById('loginButton');
      if (loginButton) {
        loginButton.addEventListener('click', async () => {
          this.isLoggedIn = await authenticate();
          this.sidebar();
          this.events();
        });
      }
    }
  };

  bindCheckbox = (selector, start = false, stop = false) => {
    document.querySelector(selector).onclick = (e) => {
      e.preventDefault();

      const isOn = getCheckboxValue(selector);
      toggleCheckbox(selector);
      if (isOn && stop) stop();
      if (!isOn && start) start();
    };
  };
}

const getCheckboxValue = (selector) =>
  document.querySelector(`${selector} .toggleSwitch > div`).className === onToggle;

const toggleCheckbox = (selector) => {
  const isOn = getCheckboxValue(selector);
  document.querySelector(`${selector} .toggleSwitch > div`).className = isOn ? offToggle : onToggle;
  document.querySelector(`${selector} .toggleSwitch > div > div`).className = isOn
    ? offToggleInner
    : onToggleInner;
};

export { getCheckboxValue, toggleCheckbox };

export default Sidebar;

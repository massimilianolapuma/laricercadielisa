/**
 * Quick favicon test debug
 */

import { describe, it, expect, beforeEach } from "vitest";

describe("Favicon Debug Test", () => {
  beforeEach(() => {
    // Set up basic DOM
    document.body.innerHTML = `
      <div id="tabList"></div>
    `;
  });

  it("should create favicon element correctly", () => {
    const tab = {
      id: 1,
      title: "Test",
      url: "test.com",
      favIconUrl: null,
    };

    const html = `
      <div class="tab-item" data-tab-id="${tab.id}">
        <img src="${
          tab.favIconUrl ||
          'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><circle cx="8" cy="8" r="8" fill="%23ccc"/></svg>'
        }" alt="" class="tab-favicon">
        <div class="tab-info">
          <div class="tab-title">${tab.title}</div>
          <div class="tab-url">${tab.url}</div>
        </div>
      </div>
    `;

    document.getElementById("tabList").innerHTML = html;

    const favicon = document.querySelector(".tab-favicon");
    expect(favicon).toBeTruthy();
    expect(favicon.src).toContain("data:image/svg+xml");
  });
});

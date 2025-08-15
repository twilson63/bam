// Modern JavaScript equivalent of the CoffeeScript template
// This would be used with a template engine that supports JS functions

export default function renderRevealPage() {
  return `
    <div class="reveal">
      <div class="state-background"></div>
      <div class="slides">
        <section>
          <h1>RevealJS</h1>
        </section>
      </div>
    </div>
    
    <aside class="controls">
      <a class="left" href="#">&#x25C4;</a>
      <a class="right" href="#">&#x25BA;</a>
      <a class="up" href="#">&#x25B2;</a>
      <a class="down" href="#">&#x25BC;</a>
    </aside>
    
    <!-- Presentation progress bar -->
    <div class="progress">
      <span></span>
    </div>
  `;
}

// Alternative: Direct HTML content for static generation
export const revealPageHTML = `
<div class="reveal">
  <div class="state-background"></div>
  <div class="slides">
    <section>
      <h1>RevealJS</h1>
    </section>
  </div>
</div>

<aside class="controls">
  <a class="left" href="#">&#x25C4;</a>
  <a class="right" href="#">&#x25BA;</a>
  <a class="up" href="#">&#x25B2;</a>
  <a class="down" href="#">&#x25BC;</a>
</aside>

<!-- Presentation progress bar -->
<div class="progress">
  <span></span>
</div>
`;
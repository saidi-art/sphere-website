/* Sphere waiting-list form. Vanilla, no dependencies. */
(function(){
  var CONFIG = {
    endpoint: "",            /* set to the deployed Apps Script URL when it goes live */
    launched: false          /* when true, the form is replaced by the Play badge at build time */
  };
  function wire(id){
    var form = document.getElementById(id);
    if(!form) return;
    var email = form.querySelector("input[type=email]");
    var state = form.querySelector(".state");
    var btn = form.querySelector("button");
    function say(msg, cls){ state.textContent = msg; state.className = "state " + (cls || ""); }
    form.addEventListener("submit", function(ev){
      ev.preventDefault();
      if(!email.value || !/^[[^\]s@]+@[^[^\]s@]+\.[^[^\]s@]+$/.test(email.value.trim())){
        say("That email doesn't look right.", "err");
        email.setAttribute("aria-invalid", "true");
        return;
      }
      email.removeAttribute("aria-invalid");
      if(!CONFIG.endpoint){ say("Something went wrong. Try again in a moment.", "err"); return; }
      btn.disabled = true;
      say("", "");
      var s = document.createElement("span"); s.className = "spin"; s.setAttribute("aria-hidden","true");
      btn.insertBefore(s, btn.firstChild);
      var body = new URLSearchParams();
      body.set("email", email.value.trim());
      body.set("source", form.getAttribute("data-source") || "hero");
      body.set("website_field", form.querySelector("input[name=website_field]").value);
      fetch(CONFIG.endpoint, {method:"POST", body: body})
        .then(function(r){ return r.json(); })
        .then(function(d){
          if(d && (d.result === "ok")){ say("You're on the list. Watch for one email at launch.", "ok"); form.reset(); }
          else { say("Something went wrong. Try again in a moment.", "err"); }
        })
        .catch(function(){ say("Something went wrong. Try again in a moment.", "err"); })
        .then(function(){ btn.disabled = false; var t = btn.querySelector(".spin"); if(t){ t.remove(); } });
    });
  }
  wire("wl-hero"); wire("wl-join");
})();
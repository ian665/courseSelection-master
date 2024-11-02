document.addEventListener("DOMContentLoaded", function () {
  const buttons = document.querySelectorAll(".btn");
  
  buttons.forEach(button => {
    button.addEventListener("click", function () {
      alert(this.querySelector(".text").textContent.trim());
    });
  });

  // 如果有其他需要的 JavaScript 邏輯，也可以在這裡添加
});

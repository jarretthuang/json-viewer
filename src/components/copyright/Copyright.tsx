import "./assets/css/Copyright.css";

function Copyright() {
  const currentYear = new Date().getFullYear();
  return (
    <div className="Copyright">
      <div className="copyright-banner">
        <span>Copyright © {currentYear} Jarrett Huang</span>
      </div>
    </div>
  );
}

export default Copyright;

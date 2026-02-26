function Copyright() {
  return (
    <footer
      style={{
        display: "flex",
        height: "9rem",
        width: "100%",
        maxWidth: "72rem",
        alignItems: "center",
        justifyContent: "center",
        alignSelf: "center",
        paddingLeft: "2.5rem",
        paddingRight: "2.5rem",
        fontSize: "15px",
        color: "#4d4d4d",
      }}
    >
      <div style={{ display: "flex", flexDirection: "row", gap: "0.25rem" }}>
        <span>Copyright © {new Date().getFullYear()}</span>
        <a style={{ textDecoration: "underline" }} target="_blank" href="https://jhuang.ca">
          Jarrett Huang
        </a>
        <span>|</span>
        <a
          style={{ textDecoration: "underline" }}
          target="_blank"
          href="https://github.com/jarretthuang/json-viewer"
        >
          Github
        </a>
        <span>|</span>
        <a
          style={{ textDecoration: "underline" }}
          href="https://www.buymeacoffee.com/jarretthuang"
          target="_blank"
        >
          Buy me a coffee
        </a>
      </div>
    </footer>
  );
}

export default Copyright;

import NavBar from "./NavBar";

export default function InfoPageNavBar() {
  return (
    <NavBar
      actionVisibility={{
        back: false,
        forward: false,
        share: false,
        moreOptions: false,
      }}
    />
  );
}

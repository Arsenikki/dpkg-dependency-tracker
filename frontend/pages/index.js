import NavigationBar from '../components/navigation-bar';
    const uploadFile = async (file) => {
      let formData = new FormData();
      formData.append("dpkg-file", file);
      const res = await fetch('http://localhost:5000/api/upload', {
        method: "POST", 
        body: formData
        });
      const userPackages = await res.json();
      handleChangePackages(userPackages);
      console.log("userPackages", userPackages)
      return res.status === 200 ? true : false 
    };

export default function Index() {
  return <NavigationBar />;
}

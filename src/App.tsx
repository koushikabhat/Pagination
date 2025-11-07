
import { useEffect, useRef, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import "./App.css";
import { Button } from "primereact/button";
import { OverlayPanel } from "primereact/overlaypanel";










const App = () => {
  const [rowClick, _setRowClick] = useState<boolean>(false);
  const [selectedProducts, setSelectedProducts] = useState<any[]>([]);
  // const [limit, setLimit] = useState<number>(10); 


  //for current page variable
  const [currentPage, setCurrentPage] = useState<number>(1);

  //total entries 
  const [totalEntries, setTotalEntries] = useState<number>(0);

  //it contains an array response fetched from api 
  const [artworks, setArtworks] = useState<any[]>([]);
  const limit = 12; // fixed per page


  //counter
  const [selectcount, setSelectcount ] = useState<any>()

  const op = useRef<OverlayPanel>(null);

  //variable for selected rows count
  const [counter, setcounter] = useState<number>(0);



  //loading button
  const[loading , setLoading] = useState<boolean>(false);


  //function to fetch api
  const fetchApi = async () => {
    try 
    {
      //loading start 
      setLoading(true);


      //fetching only required fields 
      // const res = await fetch(`https://api.artic.edu/api/v1/artworks?page=${currentPage}&limit=${limit}`);
      const res = await fetch(`https://api.artic.edu/api/v1/artworks?page=${currentPage}&limit=${limit}&fields=id,title,place_of_origin,artist_display,inscriptions,date_start,date_end`);

      const data = await res.json();

      console.log("data is : ", data)  //debug
      console.log("data is : ", data?.data)  //debug


      setLoading(false); //loading end

      setArtworks(data?.data);
      setTotalEntries(data?.pagination?.total || 0);

      

      // console.log("total :", data?.pagination?.total) //debug
      // console.log("current page ..", currentPage); //debug
    } 
    catch (error)
    {
      setLoading(false); //loading end
      console.log("Error fetching data:", error);
      alert("Error fetching data. Please try again later.");
    }
  };



  //useeffect when the current page changes it fires the fetchApi()
  useEffect(() => {
    fetchApi();
  }, [currentPage]);





  //nextpage function
  const handleNextPage = () => {
    //incrementing the prev value +1 for next page 
    setCurrentPage((prev) => prev + 1);
  };



  //prev page handler
  const handlePrevPage = () => {
    if (currentPage > 1) 
    {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const totalPages = Math.ceil(totalEntries / limit);

  // console.log(Array.isArray(artworks)); //debug



  //select button for checked 
  const handleSelect = ()=>{
    // console.log(selectcount); //debug
 
    setSelectedProducts([]);

    //selectProduct for selectedcount
    setSelectedProducts(artworks.slice(0, Number(selectcount)));

    console.log("Selected Products after select button : ", artworks.slice(0, Number(selectcount)));


    //after submit empty the selectcount
    setSelectcount("");
  }



 //here for persistence when selected products changes the set the counter as its length
  useEffect(() =>{
    setcounter(selectedProducts.length);
  },[selectedProducts])


  return (
    <div className="app-container">


      {/* Header */}
      <header className="app-header">
        <h2>React Data Table</h2>
        <p>A clean, modern PrimeReact table with manual server-side pagination.</p>

        <div style={{fontSize : 25, fontWeight : "bolder" }}>Selected Rows : {counter}</div>
      </header>


      

      {/* Table */}
      <section className="table-container">


        {/* loading handler  */}
        {loading && (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", margin: "20px 0" }}>
            <Button label="Loading..." icon="pi pi-spin pi-spinner" severity="info" disabled />
          </div>
        )}



        {Array.isArray(artworks) && (
          <DataTable
            value={artworks}
            selectionMode={rowClick ? undefined : "checkbox"}
            selection={selectedProducts}
            onSelectionChange={(e: any) => { 

              //to retrieve selected rows and append the next selection
              const newSelection = e.value;  
              // console.log("newSelection is : ",newSelection);

              const currPageId = artworks.map((item) => Number(item.id));
              // console.log("currPageId is : ",currPageId); 

              //currid  = [4, 5,6]
              //selectedProducts = [1,2,3,4]

             // 4 remove 
              // filtered = selected - currid = [1,2,3]
             //selected = [1,2, 3]  + new = remove 4 s0 [] 

            //  return  add selected + new 

              //filtering only those which are not in current page

              setSelectedProducts((prevselected) => {
                const filteredSelection = prevselected.filter((item) =>  !currPageId.includes(Number(item.id)))
                // console.log("Result : ", [...filteredSelection, ...newSelection]);
                const merged = [...filteredSelection, ...newSelection];


                  // Remove duplicates by ID
                const unique = merged.filter(
                  (item, index, self) =>
                    index === self.findIndex((t) => Number(t.id) === Number(item.id))
                );

                return unique;

              });
              
            
              // console.log("e.value is  : ",e.value); 
              // console.log("e.value.length is : ",e.value.length)
            }}
            dataKey="id"
            stripedRows
            showGridlines
            tableStyle={{ minWidth: "70rem", height: "400px" }}
          >
            {!rowClick && (<Column selectionMode="multiple" header={<div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}><Button className="v-button p-button-text p-button-plain no-hover" icon="pi pi-chevron-down" onClick={(e) => op.current?.toggle(e)} /></div>} headerStyle={{ width: "3rem" }} />)}
            <Column field="title" header="Title" style={{ width: "25%" }} />
            <Column field="place_of_origin"  header="Place of Origin" style={{ width: "15%" }}/>
            <Column field="artist_display" header="Artist Display" style={{ width: "25%" }}/>
            <Column field="inscriptions" header="Inscriptions" style={{ width: "20%" }}/>
            <Column field="date_start" header="Date Start" style={{ width: "10%" }}/>
            <Column field="date_end" header="Date End" style={{ width: "10%" }}/>
          </DataTable>
          
        )}

        
        <OverlayPanel ref={op} dismissable>
          <div style={{ padding: "10px" }}>
            <div style={{fontSize : 18, fontWeight : "bold"}}>Select multiple Rows </div>
            <div>Enter number of rows</div>

            <input  placeholder="Enter size Ex: 20" style={{height : 30, width : 140, color : "black", fontSize : 15, borderRadius : 5}}   value={selectcount}   onChange={(e)=> {setSelectcount(e.target.value)}  }/> <Button style={{height : 35, borderColor : "black"}} onClick={()=> handleSelect()}>Select</Button>
          </div>
        </OverlayPanel>


        

      </section>
      









      {/* Pagination Controls */}
      <div className="pagination-controls">
        <button onClick={() => handlePrevPage() } disabled={currentPage === 1 || loading} className="nav-btn"> ← Prev Page </button>

        {/* small info about the pages */}
        <span className="page-info"> Page {currentPage} of {totalPages || 1 || loading}</span>

        <button onClick={() => handleNextPage() } disabled={currentPage >= totalPages} className="nav-btn"> Next Page → </button>
      </div>



    </div>
  );
};

export default App;

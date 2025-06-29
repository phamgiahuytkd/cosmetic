export function SlideChanger(Props) {
    return(
    <div className="container">
        <div className="SlideChanger" style={
            {"--dynamic-bg": Props.color,"--brand--": `"${Props.brand || 'Default Brand'}"`}
        }>
            <div className="Content">
                <div>
                    <h4>{Props.price || '42.97$'} </h4>
                    <h1>{Props.name || 'Nike SuperRep Go'} </h1>
                    <p>{Props.detail || 'Lorem ipsum dolor, sit amet consectetur adipisicing elit. Necessitatibus, rerum. Omnis deserunt libero voluptate quasi.'
                       + 'Eaque nam odio esse deleniti, cum ipsum tempora suscipit eum ex quia odit sed in accusantium vel natus, aliquid ipsa.'} </p>
                    <a href="#" className="btn">Add to</a>
                </div>
                <div className="shoe">
                    <img src={`http://localhost:8080/iCommerce/images/${Props.image}`} alt="NikeSuperRepGo" srcset=""/>
                </div> 
            </div> 
        </div>
    </div>
    );
};
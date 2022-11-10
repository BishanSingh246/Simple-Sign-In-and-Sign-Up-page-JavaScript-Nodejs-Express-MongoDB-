

$('#new_signup').submit(function(event){
    alert("New user Register sucessfully");
});

$('#update_user').submit(function(event){
    event.preventDefault();
    // we can use thsi belo one also
    var unindexed_array = $('#update_user').serializeArray();
    // var unindexed_array = $(this).serializeArray();
    var data = {}
    console.log(data);
    $.map(unindexed_array, function (n, i) {
        data[n['name']] = n['value']

    })

    var request = {
        'url': `http://localhost:8080/api/users/${data.id}`,
        "method": 'PUT',
        "data": data
    }

    $.ajax(request).done(function(response) {
        alert("Data Updated successfully");
    })
})

if(window.location.pathname =="/"){
    $ondelete =$("a.delete")
    $ondelete.click(function(){
        var id = $(this).attr("data-id")

        var request = {
            'url': `http://localhost:8080/api/users/${id}`,
            "method": 'DELETE'
        }
        if(confirm("DO you really want to delete this user record")){
            $.ajax(request).done(function(response) {
                alert("Data Deleted successfully");
                location.reload()
            })
        }
    })
}
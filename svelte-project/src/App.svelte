<script lang="ts">
	function print() {
		// Create window for printing
		const printContent = document.querySelector(".print");
		const printWindow = window.open('', '', 'left=0,top=0,width=800,height=900,toolbar=0,scrollbars=0,status=0');

		// Link CSS and write HTML
		printWindow.document.write("<link rel='stylesheet' href='bootstrap.min.css'>");
		printWindow.document.write(printContent.innerHTML);

		// Focus and call browser print
		printWindow.document.close();
		printWindow.focus();
		printWindow.print();
	}
</script>

<main>
	<header class="bg-dark text-center p-2 mb-3">
		<h1 class="my-3 text-white">Biostatistics Flyer Maker</h1>
	</header>

	<div class="container">
		<!-- Print Button -->
		<div class="container float pointer-hover" on:click={print}>
			<span><i class="centered-item fas fa-print fa-2x"></i></span>
		</div>

		<!-- Printable Area -->
		<div class="container print-area print" paper-size="US-LETTER">
			<div class="row full-width mb-3">
				
			</div>
		</div>
	</div>
</main>

<style>
	.centered-item {
        position: absolute;
        top: 50%;
        left: 50%;
        -moz-transform: translateX(-50%) translateY(-50%);
        -webkit-transform: translateX(-50%) translateY(-50%);
        transform: translateX(-50%) translateY(-50%);
	}
	
	.float {
        position: fixed;
        width: 60px;
        height: 60px;
        bottom: 80px;
        right: 40px;
        background-color: #292929;
        color: ghostwhite;
        border-radius: 50px;
        text-align: center;
        padding-top: 2.5vw;
        box-shadow: 2px 2px 3px #999
	}

	.full-width {
		box-sizing: border-box;
		width: 100%;
	}
	
	.pointer-hover:hover {
        cursor: pointer;
	}
	
	.print-area[paper-size="US-LETTER"] {
		border: #292929;
		border-width: 5px;
		width: 22cm;
		height: 28cm;
	}
</style>